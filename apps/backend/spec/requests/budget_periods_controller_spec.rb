require "rails_helper"

RSpec.describe "BudgetPeriods API", type: :request do
  let(:session) { create(:session) }
  let(:user) { session.user }
  let(:today) { Date.current }
  let(:headers) do
    {
      Authorization: "Bearer #{session.token}",
      Accept: "application/json"
    }
  end

  let!(:account) { create(:account, user: user, currency: "CLP") }
  let!(:expense_group) do
    user.category_groups.create!(
      name: "Essentials #{SecureRandom.hex(4)}",
      group_type: :expense,
      display_order: 1,
    )
  end
  let!(:budgeted_grouped_category) do
    create(
      :transaction_category,
      user: user,
      category_group: expense_group,
      name: "Groceries #{SecureRandom.hex(4)}",
      icon: "Utensils",
    )
  end
  let!(:unbudgeted_grouped_category) do
    create(
      :transaction_category,
      user: user,
      category_group: expense_group,
      name: "Dining #{SecureRandom.hex(4)}",
      icon: "UtensilsCrossed",
    )
  end
  let!(:ungrouped_category) do
    create(
      :transaction_category,
      user: user,
      name: "Shopping #{SecureRandom.hex(4)}",
      icon: "ShoppingBag",
    )
  end
  let!(:income_category) do
    create(
      :transaction_category,
      user: user,
      name: "Salary #{SecureRandom.hex(4)}",
      icon: "DollarSign",
      is_income: true,
    )
  end
  let!(:period) { user.budget_periods.create!(year: today.year, month: today.month) }
  let!(:grouped_allocation) do
    period.budget_allocations.create!(
      transaction_category: budgeted_grouped_category,
      planned_amount: 100_000,
    )
  end

  before do
    create(
      :transaction,
      account: account,
      transaction_category: income_category,
      amount: 500_000,
      currency: "CLP",
      transaction_date: today,
      post_date: today,
    )
    create(
      :transaction,
      :expense,
      account: account,
      transaction_category: budgeted_grouped_category,
      amount: -60_000,
      currency: "CLP",
      transaction_date: today,
      post_date: today,
    )
    create(
      :transaction,
      :expense,
      account: account,
      transaction_category: unbudgeted_grouped_category,
      amount: -40_000,
      currency: "CLP",
      transaction_date: today,
      post_date: today,
    )
    create(
      :transaction,
      :expense,
      account: account,
      transaction_category: ungrouped_category,
      amount: -75_000,
      currency: "CLP",
      transaction_date: today,
      post_date: today,
    )
  end

  describe "GET /budget" do
    it "separates budgeted and unbudgeted categories by allocation state" do
      get "/budget", params: { year: today.year, month: today.month, currency: "CLP" }, headers: headers

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      essentials_group = json["groups"].find { |group| group.dig("group", "id") == expense_group.id }

      expect(json["total_planned"]).to eq(100_000.0)
      expect(json["total_actual"]).to eq(175_000.0)
      expect(json["left_to_budget"]).to eq(400_000.0)
      expect(essentials_group).not_to be_nil
      expect(essentials_group["allocations"].map { |allocation| allocation["category_name"] }).to eq([ budgeted_grouped_category.name ])
      expect(json["unbudgeted_categories"].map { |category| category["name"] })
        .to contain_exactly(unbudgeted_grouped_category.name, ungrouped_category.name)
    end

    it "keeps newly budgeted ungrouped categories visible in the budgeted section" do
      period.budget_allocations.create!(
        transaction_category: ungrouped_category,
        planned_amount: 80_000,
      )

      get "/budget", params: { year: today.year, month: today.month, currency: "CLP" }, headers: headers

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      other_categories_group = json["groups"].find do |group|
        group.dig("group", "name") == "Uncategorized"
      end

      expect(json["total_planned"]).to eq(180_000.0)
      expect(json["left_to_budget"]).to eq(320_000.0)
      expect(json["unbudgeted_categories"].map { |category| category["name"] })
        .to eq([ unbudgeted_grouped_category.name ])
      expect(other_categories_group).not_to be_nil
      expect(other_categories_group["allocations"].map { |allocation| allocation["category_name"] })
        .to include(ungrouped_category.name)
    end
  end
end
