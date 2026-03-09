class RecurringTransactionsController < ApplicationController
  before_action :set_recurring_transaction, only: %i[show update destroy link_transaction unlink_transaction]

  def index
    scope = current_user.recurring_transactions.includes(:transaction_category, :account)

    scope = scope.active if params[:active].present?
    scope = scope.upcoming(params[:upcoming].to_i) if params[:upcoming].present?

    render_jsonapi scope.order(next_due_date: :asc)
  end

  def show
    render_jsonapi @recurring_transaction
  end

  def create
    @recurring_transaction = current_user.recurring_transactions.build(recurring_transaction_params)

    if @recurring_transaction.save
      render_jsonapi @recurring_transaction, status: :created
    else
      render json: { error: @recurring_transaction.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def update
    if @recurring_transaction.update(recurring_transaction_params)
      render_jsonapi @recurring_transaction
    else
      render json: { error: @recurring_transaction.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def destroy
    @recurring_transaction.destroy
    head :no_content
  end

  def link_transaction
    transaction = current_user.transactions.find(params[:transaction_id])
    link = @recurring_transaction.recurring_transaction_links.build(linked_transaction: transaction)

    if link.save
      render_jsonapi @recurring_transaction
    else
      render json: { error: link.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def unlink_transaction
    link = @recurring_transaction.recurring_transaction_links.find_by!(transaction_id: params[:transaction_id])
    link.destroy
    render_jsonapi @recurring_transaction
  end

  private

  def set_recurring_transaction
    @recurring_transaction = current_user.recurring_transactions.find(params[:id])
  end

  def recurring_transaction_params
    params.require(:recurring_transaction).permit(
      :name, :amount, :currency, :frequency, :start_date, :end_date,
      :next_due_date, :is_active, :transaction_type, :auto_create,
      :notes, :transaction_category_id, :account_id
    )
  end
end
