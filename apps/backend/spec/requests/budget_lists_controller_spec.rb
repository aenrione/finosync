RSpec.describe "BudgetLists API", type: :request do
  let(:session) { create(:session) }
  let(:user) { session.user }
  let(:headers) {
    {
      Authorization: "Bearer #{session.token}",
      Accept: "application/json"
    }
  }

  describe "GET /budget_lists" do
    let!(:lists) { create_list(:budget_list, 3, user: user) }

    it "returns paginated budget lists for the current user" do
      get "/budget_lists", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.size).to eq(3)
    end
  end

  describe "GET /budget_lists/:id" do
    context "when the list exists" do
      let(:list) { create(:budget_list, user: user) }

      it "returns the budget list" do
        get "/budget_lists/#{list.id}", headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["id"].to_s).to eq(list.id.to_s)
      end
    end

    context "when the list does not exist" do
      it "returns bad request" do
        get "/budget_lists/99999", headers: headers
        expect(response).to have_http_status(:bad_request)
      end
    end
  end

  describe "POST /budget_lists" do
    let(:valid_params) { { title: "Groceries", description: "Weekly shopping" } }

    it "creates a new budget list" do
      expect {
        post "/budget_lists", params: valid_params, headers: headers
      }.to change(BudgetList, :count).by(1)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["title"]).to eq("Groceries")
    end

    it "returns bad request with invalid data" do
      post "/budget_lists", params: { title: "" }, headers: headers
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "DELETE /budget_lists/:id" do
    context "when the list exists" do
      let!(:list) { create(:budget_list, user: user) }

      it "deletes the list" do
        expect {
          delete "/budget_lists/#{list.id}", headers: headers
        }.to change(BudgetList, :count).by(-1)

        expect(response).to have_http_status(:ok)
      end
    end

    context "when the list does not exist" do
      it "returns bad request" do
        delete "/budget_lists/99999", headers: headers
        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end

