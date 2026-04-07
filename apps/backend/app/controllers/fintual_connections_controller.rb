class FintualConnectionsController < ApplicationController
  def initiate_login
    email = params.require(:email)
    password = params.require(:password)

    FintualApiClient.initiate_login(email, password)
    render json: { message: "Verification code sent to your email" }, status: :ok
  rescue FintualApiClient::Error => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def finalize_login
    email = params.require(:email)
    password = params.require(:password)
    code = params.require(:code)
    account_name = params[:account_name] || "Fintual"

    session_data = FintualApiClient.finalize_login(email, password, code)

    account = current_user.accounts.create!(
      account_name: account_name,
      account_type: "fintual",
      primary_key: email,
      session_token: session_data[:cookie],
      session_expires_at: session_data[:expires_at],
      currency: "CLP"
    )

    # FetchAccountDataJob is auto-enqueued by after_create_commit on Account
    render_jsonapi account, status: :created
  rescue FintualApiClient::Error => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :bad_request
  end
end
