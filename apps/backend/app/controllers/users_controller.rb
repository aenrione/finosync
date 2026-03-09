class UsersController < ApplicationController
  allow_unauthenticated_access only: :create
  rate_limit to: 5, within: 10.minutes, only: :create, with: -> { render json: { error: "Too many requests. Try again later." }, status: :too_many_requests }

  def show
    render_jsonapi current_user
  end

  def create
    user = User.new(registration_params)

    if user.save
      session = user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip)
      render json: { token: session.token }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
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

  def update_preferences
    current_user.update!(preferences_params)
    render_jsonapi current_user
  end

  def destroy
    current_user.destroy!
    head :no_content
  end

  private

  def registration_params
    params.permit(:name, :email_address, :password, :password_confirmation)
  end

  def preferences_params
    params.permit(:preferred_currency, :monthly_income, :onboarding_completed, financial_goals: [])
  end
end
