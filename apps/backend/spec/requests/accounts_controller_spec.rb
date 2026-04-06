require 'rails_helper'

RSpec.describe AccountsController, type: :request do
  let(:session) { create(:session) }
  let(:user) { session.user }
  let(:account) { create(:account, user: user) }
  let(:auth_headers) {
    {
      Authorization: "Bearer #{session.token}",
      Accept: "application/json"
    }
  }

  before do
    allow_any_instance_of(ValidateFintocAccount).to receive(:perform).and_return(true)
    allow_any_instance_of(ValidateBudaAccount).to receive(:perform).and_return(true)
  end

  describe "GET /accounts" do
    it "returns the user's account" do
      account
      get "/accounts", headers: auth_headers

      puts response.body

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to be_present
    end
  end

  describe "POST /accounts" do
    context "with valid params" do
      let(:valid_params) {
        {
          primary_key: "test_link",
          secret: "secret123"
        }
      }

      it "creates a account" do
        post "/accounts", params: valid_params, headers: auth_headers

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to be_present
      end

      it "enqueues a FetchAccountDataJob for non-local accounts" do
        expect {
          post "/accounts", params: valid_params.merge(account_type: "buda", account_name: "My Buda"), headers: auth_headers
        }.to have_enqueued_job(FetchAccountDataJob)
      end

      it "does not enqueue FetchAccountDataJob for local accounts" do
        expect {
          post "/accounts", params: { account_name: "My Local", account_type: "local" }, headers: auth_headers
        }.not_to have_enqueued_job(FetchAccountDataJob)
      end
    end

    context "with invalid params" do
      before do
        allow_any_instance_of(Account).to receive(:save!).and_raise(ActiveRecord::RecordInvalid.new(Account.new))
      end

      it "returns bad request" do
        post "/accounts", params: {}, headers: auth_headers

        expect(response).to have_http_status(:bad_request)
      end
    end
  end

  describe "DELETE /accounts" do
    it "destroys the user's account" do
      account
      delete "/accounts/#{account.id}", headers: auth_headers

      expect(response).to have_http_status(:ok)
    end
  end
end
