class BudgetAllocationsController < ApplicationController
  def upsert
    period = current_user.budget_periods.find(params[:budget_period_id])
    category_id = params[:transaction_category_id]
    planned_amount = params[:planned_amount]

    allocation = period.budget_allocations.find_or_initialize_by(
      transaction_category_id: category_id
    )
    allocation.planned_amount = planned_amount
    allocation.notes = params[:notes] if params[:notes].present?

    if allocation.save
      render json: {
        id: allocation.id,
        planned_amount: allocation.planned_amount.to_f,
        transaction_category_id: allocation.transaction_category_id,
        notes: allocation.notes
      }, status: :ok
    else
      render json: { errors: allocation.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    period = current_user.budget_periods.find(params[:budget_period_id])
    allocation = period.budget_allocations.find(params[:id])
    allocation.destroy!
    head :no_content
  end
end
