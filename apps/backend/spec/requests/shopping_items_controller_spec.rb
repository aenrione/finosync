require "rails_helper"

RSpec.describe "ShoppingItems API", type: :request do
  let(:session) { create(:session) }
  let(:user) { session.user }
  let(:headers) {
    {
      Authorization: "Bearer #{session.token}",
      Accept: "application/json"
    }
  }
  let!(:list) { create(:shopping_list, user: user) }

  describe "POST /shopping_lists/:id/items" do
    let(:valid_params) { { title: "Milk", description: "2% fat", price_amount: 3.5 } }

    it "creates an item in the list" do
      post "/shopping_lists/#{list.id}/item", params: valid_params, headers: headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["title"]).to eq("Milk")
    end

    it "returns bad request if list doesn't exist" do
      post "/shopping_lists/9999/item", params: valid_params, headers: headers
      expect(response).to have_http_status(:bad_request)
    end

    it "returns bad request for invalid item data" do
      post "/shopping_lists/#{list.id}/item", params: { title: "" }, headers: headers
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "DELETE /shopping_lists/:id/item/:item_id" do
    let!(:item) { create(:shopping_item, shopping_list: list) }

    it "deletes the item" do
      delete "/shopping_lists/#{list.id}/item/#{item.id}", headers: headers

      expect(response).to have_http_status(:ok)
    end

    it "returns bad request if item not found" do
      delete "/shopping_lists/#{list.id}/item/9999", headers: headers
      expect(response).to have_http_status(:bad_request)
    end

    it "returns bad request if list not found" do
      delete "/shopping_lists/9999/item/#{item.id}", headers: headers
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "PATCH /shopping_lists/:id/item/:item_id" do
    let!(:item) { create(:shopping_item, shopping_list: list) }

    it "links a transaction and marks the item purchased" do
      account = create(:account, user: user, currency: "CLP")
      transaction = create(
        :transaction,
        :expense,
        account: account,
        transaction_date: Date.current,
      )

      patch "/shopping_lists/#{list.id}/item/#{item.id}",
            params: { transaction_id: transaction.id },
            headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["purchased"]).to eq(true)
      expect(json.dig("transaction", "id")).to eq(transaction.id)
      expect(item.reload.transaction_id).to eq(transaction.id)
    end

    it "allows unlinking a transaction" do
      account = create(:account, user: user, currency: "CLP")
      transaction = create(:transaction, :expense, account: account)
      item.update!(linked_transaction: transaction)

      patch "/shopping_lists/#{list.id}/item/#{item.id}",
            params: { transaction_id: "" },
            headers: headers

      expect(response).to have_http_status(:ok)
      expect(item.reload.transaction_id).to be_nil
      expect(item.purchased).to eq(false)
    end
  end
end
