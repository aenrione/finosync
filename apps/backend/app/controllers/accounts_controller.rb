class AccountsController < ApplicationController
  before_action :find_account, only: [ :show, :destroy, :charts ]

  def index
    @accounts = current_user.accounts
    @accounts = @accounts.where(currency: params[:currency]) if params[:currency].present?
    render_jsonapi @accounts
  end

  def show
    # Fetch chart data using snapshots for all accounts (numeric values for frontend)
    time_range = params[:time_range] || "6M"
    chart_data = GetAccountChartData.for(account: @account, time_range: time_range)

    # Fetch transactions with filters, search, pagination
    tx_scope = @account.transactions.order(transaction_date: :desc)
    tx_scope = tx_scope.where("description ILIKE ?", "%#{params[:search]}%") if params[:search].present?
    tx_scope = tx_scope.where(transaction_type: params[:type]) if params[:type].present?
    tx_scope = tx_scope.where(transaction_category_id: params[:category_id]) if params[:category_id].present?
    page = (params[:page] || 1).to_i
    per_page = 20
    paged_txs = tx_scope.offset((page - 1) * per_page).limit(per_page + 1)

    # Serialize transactions using Money formatting
    transactions_data = paged_txs.limit(per_page).map do |tx|
      {
        id: tx.id,
        amount: tx.transaction_amount.format,
        description: tx.description,
        transaction_date: tx.transaction_date,
        type: tx.transaction_type,
        category: tx.transaction_category&.name,
        account_id: tx.account_id
      }
    end
    has_more = paged_txs.size > per_page

    # Calculate insights using Money formatting
    insights = GetAccountInsights.for(account: @account)

    # Use AccountDetailSerializer with all the data
    render_jsonapi @account, {
      serializer: AccountDetailSerializer,
      params: {
        include_insights: true,
        include_chart: true,
        include_transactions: true,
        insights: insights,
        chart_data: chart_data,
        transactions: transactions_data,
        has_more: has_more
      }
    }
  end

  def charts
    time_range = params[:time_range] || "6M"
    chart_data = GetAccountChartData.for(account: @account, time_range: time_range)
    render json: chart_data, status: :ok
  end

  def create
    # Only require primary_key and secret if not a local account
    # Fintoc accounts only need primary_key (link_token from widget); secret is backend-only
    fintoc_account = params[:account_type] == "fintoc"
    unless params[:account_type] == "local" ||
           (fintoc_account && params[:primary_key].present?) ||
           (!fintoc_account && params[:primary_key].present? && params[:secret].present?)
      return render json: { error: "Primary key and secret are required for non-local accounts" }, status: :bad_request
    end

    @account = Account.new(acc_params)
    @account.user = current_user

    if @account.save
      FetchAccountDataJob.perform_later(@account.id) unless @account.local?
      render_jsonapi @account
    else
      render json: { error: @account.errors.full_messages.join(", ") }, status: :bad_request
    end
  rescue => e
    render json: { error: "Failed to create account: #{e.message}" }, status: :bad_request
  end

  def destroy
    @account.destroy!
    render json: { message: "Account deleted successfully" }, status: :ok
  end

  private

  def find_account
    @account = current_user.accounts.find_by(id: params[:id])
    render json: { error: "Account not found" }, status: :not_found unless @account
  end

  def acc_params
    params.permit(:primary_key, :secret, :account_name, :account_type, :currency)
  end

end
