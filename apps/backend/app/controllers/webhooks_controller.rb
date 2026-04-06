class WebhooksController < ApplicationController
  allow_unauthenticated_access only: [:fintoc]

  def fintoc
    Rails.logger.info("Fintoc webhook received: #{request.body.read}")
    render json: { status: "ok" }, status: :ok
  end
end
