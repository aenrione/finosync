require 'rails_helper'

RSpec.describe FintocConnectionsController, type: :request do
  let(:session) { create(:session) }
  let(:user) { session.user }
  let(:auth_headers) do
    {
      Authorization: "Bearer #{session.token}",
      Accept: "application/json"
    }
  end

  before do
    allow_any_instance_of(ValidateFintocAccount).to receive(:perform).and_return(true)
  end

  describe "POST /fintoc/link_intent" do
    let(:fintoc_response) { { "widget_token" => "li_abc_sec_xyz", "id" => "li_abc" } }

    it "returns widget_token from Fintoc API" do
      client = instance_double(FintocApiClient)
      allow(FintocApiClient).to receive(:new).and_return(client)
      allow(client).to receive(:create_link_intent).and_return(fintoc_response)

      post "/fintoc/link_intent", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["widget_token"]).to eq("li_abc_sec_xyz")
    end

    it "returns 502 when Fintoc API fails" do
      client = instance_double(FintocApiClient)
      allow(FintocApiClient).to receive(:new).and_return(client)
      allow(client).to receive(:create_link_intent).and_raise(FintocApiClient::Error, "API down")

      post "/fintoc/link_intent", headers: auth_headers

      expect(response).to have_http_status(:bad_gateway)
      expect(response.parsed_body["error"]).to include("bank connection")
    end

    it "requires authentication" do
      post "/fintoc/link_intent"

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /fintoc/exchange" do
    let(:fintoc_response) { { "link_token" => "link_abc_token_xyz", "institution" => { "name" => "Banco BICE" } } }

    before do
      @client = instance_double(FintocApiClient)
      allow(FintocApiClient).to receive(:new).and_return(@client)
      allow(@client).to receive(:exchange_token).and_return(fintoc_response)
    end

    it "exchanges token and creates account" do
      post "/fintoc/exchange",
           params: { exchange_token: "et_test", account_name: "My Bank", currency: "CLP" },
           headers: auth_headers

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body["account_name"]).to eq("My Bank")
      expect(body["account_type"]).to eq("fintoc")

      account = user.accounts.last
      expect(account.primary_key).to be_present
      expect(account.account_name).to eq("My Bank")
      expect(account.currency).to eq("CLP")
    end

    it "defaults currency to CLP when not provided" do
      post "/fintoc/exchange",
           params: { exchange_token: "et_test", account_name: "My Bank" },
           headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(user.accounts.last.currency).to eq("CLP")
    end

    it "returns 422 when exchange_token is missing" do
      post "/fintoc/exchange",
           params: { account_name: "My Bank" },
           headers: auth_headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("exchange_token")
    end

    it "returns 422 when account_name is missing" do
      post "/fintoc/exchange",
           params: { exchange_token: "et_test" },
           headers: auth_headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("account_name")
    end

    it "returns 502 when Fintoc API fails" do
      allow(@client).to receive(:exchange_token).and_raise(FintocApiClient::Error, "Bad token")

      post "/fintoc/exchange",
           params: { exchange_token: "et_bad", account_name: "My Bank" },
           headers: auth_headers

      expect(response).to have_http_status(:bad_gateway)
      expect(response.parsed_body["error"]).to include("bank connection")
    end

    it "requires authentication" do
      post "/fintoc/exchange", params: { exchange_token: "et_test", account_name: "My Bank" }

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
