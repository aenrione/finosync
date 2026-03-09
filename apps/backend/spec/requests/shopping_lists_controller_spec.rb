require "rails_helper"

RSpec.describe "ShoppingLists API", type: :request do
  let(:session) { create(:session) }
  let(:user) { session.user }
  let(:headers) {
    {
      Authorization: "Bearer #{session.token}",
      Accept: "application/json"
    }
  }

  describe "GET /shopping_lists" do
    let!(:lists) { create_list(:shopping_list, 3, user: user) }

    it "returns paginated shopping lists for the current user" do
      get "/shopping_lists", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.size).to eq(3)
    end
  end

  describe "GET /shopping_lists/:id" do
    context "when the list exists" do
      let(:list) { create(:shopping_list, user: user) }

      it "returns the shopping list" do
        get "/shopping_lists/#{list.id}", headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["id"].to_s).to eq(list.id.to_s)
      end
    end

    context "when the list does not exist" do
      it "returns bad request" do
        get "/shopping_lists/99999", headers: headers
        expect(response).to have_http_status(:bad_request)
      end
    end
  end

  describe "POST /shopping_lists" do
    let(:valid_params) { { title: "Groceries", description: "Weekly shopping" } }

    it "creates a new shopping list" do
      expect {
        post "/shopping_lists", params: valid_params, headers: headers
      }.to change(ShoppingList, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["title"]).to eq("Groceries")
    end

    it "returns bad request with invalid data" do
      post "/shopping_lists", params: { title: "" }, headers: headers
      expect(response).to have_http_status(:bad_request)
    end

    it "allows linking a budget allocation" do
      period = create(:budget_period, user: user)
      category = create(:transaction_category, user: user)
      allocation = create(
        :budget_allocation,
        budget_period: period,
        transaction_category: category,
      )

      post "/shopping_lists",
           params: valid_params.merge(budget_allocation_id: allocation.id),
           headers: headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json.dig("budget_allocation", "id")).to eq(allocation.id)
    end
  end

  describe "PATCH /shopping_lists/:id" do
    let!(:list) { create(:shopping_list, user: user) }

    it "updates the linked budget allocation" do
      period = create(:budget_period, user: user)
      category = create(:transaction_category, user: user)
      allocation = create(
        :budget_allocation,
        budget_period: period,
        transaction_category: category,
      )

      patch "/shopping_lists/#{list.id}",
            params: { budget_allocation_id: allocation.id },
            headers: headers

      expect(response).to have_http_status(:ok)
      expect(list.reload.budget_allocation_id).to eq(allocation.id)
    end
  end

  describe "DELETE /shopping_lists/:id" do
    context "when the list exists" do
      let!(:list) { create(:shopping_list, user: user) }

      it "deletes the list" do
        expect {
          delete "/shopping_lists/#{list.id}", headers: headers
        }.to change(ShoppingList, :count).by(-1)

        expect(response).to have_http_status(:ok)
      end
    end

    context "when the list does not exist" do
      it "returns bad request" do
        delete "/shopping_lists/99999", headers: headers
        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end
