class SessionsController < ApplicationController
  skip_before_action :require_authentication, only: [ :create ]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to new_session_url, alert: "Try again later." }

  def new
  end

  def create
    if user = User.authenticate_by(email_address: params[:email_address], password: params[:password])
      session = user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip)
      render json: { token: session.token }, status: :created
    else
      render json: { error: "Invalid credentials" }, status: :unauthorized
    end
  end

  def destroy
    terminate_session
    redirect_to new_session_path
  end
end
