class TransactionsController < ApplicationController
  def index
    @user = current_user

    # Start with user's transactions
    transactions_scope = @user.transactions

    # Filter by account_id if provided
    if params[:account_id].present?
      account = @user.accounts.find_by(id: params[:account_id])
      return head(:not_found) unless account

      transactions_scope = transactions_scope.where(account: account)
    end

    # Filter by currency if provided
    if params[:currency].present?
      transactions_scope = transactions_scope.joins(:account).where(accounts: { currency: params[:currency] })
    end

    pagy, transactions = get_pagination(transactions_scope)

    # Include pagination metadata in response headers and body
    response.headers["X-Pagy-Meta"] = pagy_metadata(pagy).to_json

    render_jsonapi transactions, { meta: pagy_metadata(pagy) }
  end

  def show
    @transaction = current_user.transactions.find_by(id: params[:id])
    return head(:not_found) if @transaction.blank?

    render_jsonapi @transaction
  end

  def create
    @account = current_user.accounts.find_by(id: params[:account_id])
    return head(:not_found) unless @account

    # Only allow manual transactions for local accounts
    return head(:forbidden) unless @account.local?

    @transaction = Transaction.new(transaction_params)
    @transaction.account = @account
    @transaction.currency = @account.currency

    if @transaction.save
      render_jsonapi @transaction, status: :created
    else
      render json: { error: @transaction.errors.full_messages.join(", ") }, status: :bad_request
    end
  end

  def update
    @transaction = current_user.transactions.find_by(id: params[:id])
    return head(:not_found) unless @transaction

    # Only allow updates for transactions from local accounts
    return head(:forbidden) unless @transaction.account.local?

    if @transaction.update(transaction_params)
      render_jsonapi @transaction, status: :ok
    else
      render json: { error: @transaction.errors.full_messages.join(", ") }, status: :bad_request
    end
  end

  def destroy
    @transaction = current_user.transactions.find_by(id: params[:id])
    return head(:not_found) unless @transaction

    # Only allow deletion for transactions from local accounts
    return head(:forbidden) unless @transaction.account.local?

    if @transaction.destroy
      render json: { message: "Transaction deleted successfully" }, status: :ok
    else
      render json: { error: "Failed to delete transaction" }, status: :bad_request
    end
  end

  def add_to_category
    category = current_user.transaction_categories.find_by(id: params[:category_id])
    @transaction = current_user.transactions.find_by(id: params[:id])
    return head(:bad_request) if @transaction.blank? || category.blank?

    @transaction.transaction_category = category
    @transaction.save!
    render_jsonapi @transaction
  end

  def remove_category
    @transaction = current_user.transactions.find_by(id: params[:id])
    return head(:bad_request) if @transaction.blank? || @transaction.transaction_category.blank?

    @transaction.transaction_category = nil
    @transaction.save!
    render_jsonapi @transaction
  end

  private

  def transaction_params
    params.permit(:description, :amount, :transaction_date, :transaction_category_id, :comment)
  end
end
