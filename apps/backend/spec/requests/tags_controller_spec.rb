require "rails_helper"

RSpec.describe "Tags API", type: :request do
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

  describe "GET /tags" do
    it "returns user tags" do
      create_list(:tag, 3, user: user)

      get "/tags", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.size).to eq(3)
    end

    it "filters by search param" do
      create(:tag, name: "groceries", user: user)
      create(:tag, name: "transport", user: user)

      get "/tags", headers: auth_headers, params: { search: "groc" }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.size).to eq(1)
      expect(response.parsed_body.first["name"]).to eq("groceries")
    end
  end

  describe "POST /tags" do
    it "creates a tag" do
      post "/tags", headers: auth_headers, params: { tag: { name: "food", color: "#FF0000" } }

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["name"]).to eq("food")
      expect(response.parsed_body["color"]).to eq("#FF0000")
    end

    it "rejects duplicate names" do
      create(:tag, name: "food", user: user)

      post "/tags", headers: auth_headers, params: { tag: { name: "food" } }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH /tags/:id" do
    it "updates a tag" do
      tag = create(:tag, name: "old", user: user)

      patch "/tags/#{tag.id}", headers: auth_headers, params: { tag: { name: "new" } }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["name"]).to eq("new")
    end
  end

  describe "DELETE /tags/:id" do
    it "deletes a tag" do
      tag = create(:tag, user: user)

      expect {
        delete "/tags/#{tag.id}", headers: auth_headers
      }.to change(Tag, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end

  describe "POST /transactions/:id/tags" do
    it "sets tags on a transaction" do
      account = create(:account, user: user)
      transaction = create(:transaction, account: account)
      tags = create_list(:tag, 2, user: user)

      post "/transactions/#{transaction.id}/tags",
           headers: auth_headers,
           params: { tag_ids: tags.map(&:id) }

      expect(response).to have_http_status(:ok)
      expect(transaction.reload.tags.count).to eq(2)
    end

    it "replaces existing tags" do
      account = create(:account, user: user)
      transaction = create(:transaction, account: account)
      old_tag = create(:tag, user: user)
      new_tag = create(:tag, user: user)
      transaction.tags << old_tag

      post "/transactions/#{transaction.id}/tags",
           headers: auth_headers,
           params: { tag_ids: [new_tag.id] }

      expect(response).to have_http_status(:ok)
      expect(transaction.reload.tags).to eq([new_tag])
    end
  end
end
