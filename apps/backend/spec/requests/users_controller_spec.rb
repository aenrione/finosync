require 'rails_helper'

RSpec.describe UsersController, type: :request do
  let(:user) { create(:user) }
  let(:session) { create(:session, user: user) }
  let(:auth_headers) { {
    Authorization: "Bearer #{session.token}",
    Accept: "application/json"
  } }

  before do
    allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(user)
  end

  describe "GET /show" do
    it "returns the current user" do
      get "/user", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to be_present
    end
  end

  describe "GET /balance_to_chart" do
    it "returns balance chart data" do
      allow(UserBalanceToChart).to receive(:for).and_return({ balance: [ 1, 2, 3 ] })

      get "/user/balance_to_chart", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to include("balance")
    end
  end

  describe "GET /transactions_by_category_to_chart" do
    it "returns chart data by category" do
      allow(TransactionsToChart).to receive(:for).and_return({ categories: [ "Food", "Bills" ] })

      get "/user/transactions_to_chart", params: { month: "2025-06", type: "expense" }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to include("categories")
    end
  end

  describe "GET /get_capabilities" do
    it "returns user capabilities" do
      allow(GetUserCapabilities).to receive(:for).and_return({ capabilities: [ "export", "import" ] })

      get "/user/capabilities", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to include("capabilities")
    end
  end

  describe "POST /update_everything" do
    it "queues a background job" do
      expect(UpdateOneUserJob).to receive(:perform_later).with(user.email)

      post "/user/update_info", headers: auth_headers

      expect(response).to have_http_status(:ok)
    end
  end

  describe "DELETE /user" do
    it "destroys the current user and returns no content" do
      delete "/user", headers: auth_headers

      expect(response).to have_http_status(:no_content)
      expect(User.find_by(id: user.id)).to be_nil
    end

    it "destroys all associated records" do
      create(:session, user: user)

      delete "/user", headers: auth_headers

      expect(response).to have_http_status(:no_content)
      expect(Session.where(user_id: user.id)).to be_empty
    end
  end

  describe "PATCH /user/preferences" do
    it "updates preferred_currency" do
      patch "/user/preferences", params: { preferred_currency: "USD" }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(user.reload.preferred_currency).to eq("USD")
    end
  end

  describe "POST /set_quota" do
    context "with valid quota param" do
      it "updates the user's quota" do
        post "/user/set_quota", params: { quota: 42 }, headers: auth_headers

        expect(response).to have_http_status(:ok)
        expect(user.reload.quota).to eq(42)
      end
    end

    context "with missing quota param" do
      it "returns bad request" do
        post "/user/set_quota", params: {}, headers: auth_headers

        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end
