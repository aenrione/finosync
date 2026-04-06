require "rails_helper"

RSpec.describe "Rules API", type: :request do
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

  describe "GET /rules" do
    it "returns user rules ordered by priority" do
      create(:rule, user: user, name: "Second", priority: 1)
      create(:rule, user: user, name: "First", priority: 0)

      get "/rules", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.map { |rule| rule["name"] }).to eq([ "First", "Second" ])
    end
  end

  describe "POST /rules" do
    it "creates a rule" do
      category = create(:transaction_category, user: user)
      tag = create(:tag, user: user)

      post "/rules",
           headers: auth_headers,
           params: {
             rule: {
               name: "Amazon rule",
               enabled: true,
               conditions: {
                 logic: "and",
                 children: [
                   {
                     field: "merchant",
                     operator: "contains",
                     value: "amazon"
                   }
                 ]
               },
               actions: [
                 {
                   type: "assign_category",
                   transaction_category_id: category.id
                 },
                 {
                   type: "add_tags",
                   tag_ids: [ tag.id ]
                 }
               ]
             }
           }

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["name"]).to eq("Amazon rule")
      expect(response.parsed_body["actions"].size).to eq(2)
    end
  end

  describe "PATCH /rules/:id" do
    it "updates a rule" do
      rule = create(:rule, user: user, enabled: true)

      patch "/rules/#{rule.id}",
            headers: auth_headers,
            params: { rule: { enabled: false, description: "Updated" } }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["enabled"]).to be(false)
      expect(response.parsed_body["description"]).to eq("Updated")
    end
  end

  describe "POST /rules/:id/run" do
    it "queues the rule job" do
      rule = create(:rule, user: user)

      expect(RunRuleJob).to receive(:perform_later).with(rule.id)

      post "/rules/#{rule.id}/run", headers: auth_headers

      expect(response).to have_http_status(:accepted)
    end
  end

  describe "POST /rules/run_all" do
    it "queues the run all job" do
      expect(RunAllRulesJob).to receive(:perform_later).with(user.id)

      post "/rules/run_all", headers: auth_headers

      expect(response).to have_http_status(:accepted)
    end
  end

  describe "POST /rules/reorder" do
    it "updates priorities in order" do
      first = create(:rule, user: user, priority: 0, name: "First")
      second = create(:rule, user: user, priority: 1, name: "Second")

      post "/rules/reorder",
           headers: auth_headers,
           params: { ordered_ids: [ second.id, first.id ] }

      expect(response).to have_http_status(:ok)
      expect(first.reload.priority).to eq(1)
      expect(second.reload.priority).to eq(0)
    end
  end
end
