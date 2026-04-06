require 'rails_helper'

RSpec.describe WebhooksController, type: :request do
  describe "POST /webhooks/fintoc" do
    let(:fintoc_payload) do
      {
        type: "link.created",
        data: {
          link_token: "link_test_abc123",
          institution: { id: "cl_banco_estado", name: "Banco Estado" }
        }
      }
    end

    it "returns 200 OK with valid payload" do
      post "/webhooks/fintoc", params: fintoc_payload, as: :json

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq({ "status" => "ok" })
    end

    it "returns 200 OK with empty body" do
      post "/webhooks/fintoc", as: :json

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq({ "status" => "ok" })
    end

    it "does not require authentication" do
      post "/webhooks/fintoc", params: fintoc_payload, as: :json

      expect(response).to have_http_status(:ok)
    end

    it "logs the webhook event" do
      allow(Rails.logger).to receive(:info)

      post "/webhooks/fintoc", params: fintoc_payload, as: :json

      expect(Rails.logger).to have_received(:info).with(/Fintoc webhook received/)
    end
  end
end
