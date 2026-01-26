class UsersController < ApplicationController
  def show
    render_jsonapi current_user
  end

  # GET /users/balances - returns the user's balances by currency
  def balances
    balances = current_user.balances
    puts "Balances: #{balances.inspect}"
    render json: balances, status: :ok
  end

  def balance_to_chart
    chart_data = UserBalanceToChart.for(user: current_user)
    respond_with(chart_data)
  end

  def transactions_by_category_to_chart
    chart_data = TransactionsToChart.for(user: current_user, month: params[:month],
                                         type: params[:type])
    respond_with(chart_data)
  end

  def get_capabilities
    respond_with(GetUserCapabilities.for(user: current_user))
  end

  def update_everything
    UpdateOneUserJob.perform_async(current_user.email)
    respond_with(current_user, status: :ok)
  end

  def set_quota
    return head(:bad_request) if params[:quota].blank?

    current_user.quota = params[:quota]

    current_user.save!
    render_jsonapi current_user, status: :ok
  end
end
