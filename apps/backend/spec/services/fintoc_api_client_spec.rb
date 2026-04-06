require 'rails_helper'
require 'webmock/rspec'

RSpec.describe FintocApiClient do
  let(:secret_key) { "sk_test_abc123" }
  let(:client) { described_class.new(secret_key: secret_key) }

  describe "#create_link_intent" do
    let(:fintoc_response) do
      {
        id: "li_abc123",
        widget_token: "li_abc123_sec_xyz789",
        product: "movements",
        holder_type: "individual",
        country: "cl"
      }.to_json
    end

    it "sends POST to Fintoc API and returns parsed response" do
      stub_request(:post, "https://api.fintoc.com/v1/link_intents")
        .with(
          headers: { "Authorization" => secret_key, "Content-Type" => "application/json" },
          body: { product: "movements", holder_type: "individual", country: "cl" }.to_json
        )
        .to_return(status: 201, body: fintoc_response, headers: { "Content-Type" => "application/json" })

      result = client.create_link_intent(product: "movements", holder_type: "individual", country: "cl")

      expect(result["widget_token"]).to eq("li_abc123_sec_xyz789")
      expect(result["id"]).to eq("li_abc123")
    end

    it "raises FintocApiClient::Error on non-2xx response" do
      stub_request(:post, "https://api.fintoc.com/v1/link_intents")
        .to_return(status: 401, body: { error: { message: "Invalid API key" } }.to_json,
                   headers: { "Content-Type" => "application/json" })

      expect { client.create_link_intent(product: "movements", holder_type: "individual", country: "cl") }
        .to raise_error(FintocApiClient::Error, /Invalid API key/)
    end
  end

  describe "#exchange_token" do
    let(:exchange_response) do
      {
        id: "li_abc123",
        link_token: "link_abc123_token_xyz789",
        institution: { id: "cl_banco_bice", name: "Banco BICE" }
      }.to_json
    end

    it "sends GET to links/exchange endpoint and returns parsed response" do
      stub_request(:get, "https://api.fintoc.com/v1/links/exchange?exchange_token=et_test_token")
        .with(headers: { "Authorization" => secret_key })
        .to_return(status: 200, body: exchange_response, headers: { "Content-Type" => "application/json" })

      result = client.exchange_token(exchange_token: "et_test_token")

      expect(result["link_token"]).to eq("link_abc123_token_xyz789")
    end

    it "raises FintocApiClient::Error on non-2xx response" do
      stub_request(:get, "https://api.fintoc.com/v1/links/exchange?exchange_token=bad_token")
        .to_return(status: 400, body: { error: { message: "Invalid exchange token" } }.to_json,
                   headers: { "Content-Type" => "application/json" })

      expect { client.exchange_token(exchange_token: "bad_token") }
        .to raise_error(FintocApiClient::Error, /Invalid exchange token/)
    end
  end
end
