RSpec.describe "BudgetItems API", type: :request do
  let(:session) { create(:session) }
  let(:user) { session.user }
  let(:headers) {
    {
      Authorization: "Bearer #{session.token}",
      Accept: "application/json"
    }
  }
  let!(:list) { create(:budget_list, user: user) }

  describe "POST /budget_lists/:id/items" do
    let(:valid_params) { { title: "Milk", description: "2% fat", price_amount: 3.5 } }

    it "creates an item in the list" do
      puts "url: /budget_lists/#{list.id}/items"
      post "/budget_lists/#{list.id}/item", params: valid_params, headers: headers

      puts "response: #{response.body}"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["title"]).to eq("Milk")
    end

    it "returns bad request if list doesn't exist" do
      post "/budget_lists/9999/item", params: valid_params, headers: headers
      expect(response).to have_http_status(:bad_request)
    end

    it "returns bad request for invalid item data" do
      post "/budget_lists/#{list.id}/item", params: { title: "" }, headers: headers
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "DELETE /budget_lists/:id/item/:item_id" do
    let!(:item) { create(:budget_item, budget_list: list) }

    it "deletes the item" do
      delete "/budget_lists/#{list.id}/item/#{item.id}", headers: headers

      expect(response).to have_http_status(:ok)
    end

    it "returns bad request if item not found" do
      delete "/budget_lists/#{list.id}/item/9999", headers: headers
      expect(response).to have_http_status(:bad_request)
    end

    it "returns bad request if list not found" do
      delete "/budget_lists/9999/item/#{item.id}", headers: headers
      expect(response).to have_http_status(:bad_request)
    end
  end
end
