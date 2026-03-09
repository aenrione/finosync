require "rails_helper"

RSpec.describe "Recurring Transactions API", type: :request do
  let(:session) { create(:session) }
  let(:user) { session.user }
  let(:auth_headers) {
    {
      Authorization: "Bearer #{session.token}",
      Accept: "application/json"
    }
  }

  before do
    allow_any_instance_of(ValidateFintocAccount).to receive(:perform).and_return(true)
  end

  describe "GET /recurring_transactions" do
    it "returns user recurring transactions" do
      create_list(:recurring_transaction, 3, user: user)

      get "/recurring_transactions", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.size).to eq(3)
    end

    it "filters by active" do
      create(:recurring_transaction, user: user, is_active: true)
      create(:recurring_transaction, user: user, is_active: false)

      get "/recurring_transactions", headers: auth_headers, params: { active: true }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.size).to eq(1)
    end
  end

  describe "POST /recurring_transactions" do
    it "creates a recurring transaction" do
      params = {
        recurring_transaction: {
          name: "Netflix",
          amount: 15000,
          currency: "CLP",
          frequency: "monthly",
          start_date: "2026-01-01",
          next_due_date: "2026-02-01",
          transaction_type: "expense"
        }
      }

      post "/recurring_transactions", headers: auth_headers, params: params

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["name"]).to eq("Netflix")
    end

    it "rejects without name" do
      params = {
        recurring_transaction: {
          amount: 15000,
          start_date: "2026-01-01",
          next_due_date: "2026-02-01"
        }
      }

      post "/recurring_transactions", headers: auth_headers, params: params

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH /recurring_transactions/:id" do
    it "updates a recurring transaction" do
      rt = create(:recurring_transaction, user: user, name: "Old Name")

      patch "/recurring_transactions/#{rt.id}",
            headers: auth_headers,
            params: { recurring_transaction: { name: "New Name" } }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["name"]).to eq("New Name")
    end
  end

  describe "DELETE /recurring_transactions/:id" do
    it "deletes a recurring transaction" do
      rt = create(:recurring_transaction, user: user)

      expect {
        delete "/recurring_transactions/#{rt.id}", headers: auth_headers
      }.to change(RecurringTransaction, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
