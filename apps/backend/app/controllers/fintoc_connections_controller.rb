class FintocConnectionsController < ApplicationController
  def create_link_intent
    client = FintocApiClient.new
    result = client.create_link_intent(product: "movements", holder_type: "individual", country: "cl")
    render json: { widget_token: result["widget_token"] }, status: :ok
  rescue FintocApiClient::Error => e
    Rails.logger.error("Fintoc link_intent error: #{e.message}")
    render json: { error: "Failed to initialize bank connection" }, status: :bad_gateway
  end

  def exchange
    if params[:exchange_token].blank?
      return render json: { error: "exchange_token is required" }, status: :unprocessable_entity
    end
    if params[:account_name].blank?
      return render json: { error: "account_name is required" }, status: :unprocessable_entity
    end

    client = FintocApiClient.new
    result = client.exchange_token(exchange_token: params[:exchange_token])
    link_token = result["link_token"]

    account = current_user.accounts.new(
      account_type: :fintoc,
      account_name: params[:account_name],
      primary_key: link_token,
      currency: params[:currency] || "CLP"
    )

    if account.save
      render_jsonapi account
    else
      render json: { error: account.errors.full_messages.join(", ") }, status: :bad_request
    end
  rescue FintocApiClient::Error => e
    Rails.logger.error("Fintoc exchange error: #{e.message}")
    render json: { error: "Failed to complete bank connection" }, status: :bad_gateway
  end
end
