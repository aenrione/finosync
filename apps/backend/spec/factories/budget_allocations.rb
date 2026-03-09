# == Schema Information
#
# Table name: budget_allocations
#
#  id                      :integer          not null, primary key
#  notes                   :string
#  planned_amount          :decimal(14, 2)   default(0.0), not null
#  rollover_in             :decimal(14, 2)   default(0.0)
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  budget_period_id        :integer          not null
#  transaction_category_id :integer          not null
#
# Indexes
#
#  idx_allocations_period_category                      (budget_period_id,transaction_category_id) UNIQUE
#  index_budget_allocations_on_budget_period_id         (budget_period_id)
#  index_budget_allocations_on_transaction_category_id  (transaction_category_id)
#
# Foreign Keys
#
#  budget_period_id         (budget_period_id => budget_periods.id)
#  transaction_category_id  (transaction_category_id => transaction_categories.id)
#
FactoryBot.define do
  factory :budget_allocation do
    association :budget_period
    planned_amount { 100_000 }
    rollover_in { 0 }
    notes { "Shopping support" }

    after(:build) do |budget_allocation|
      budget_allocation.transaction_category ||= build(
        :transaction_category,
        user: budget_allocation.budget_period.user,
      )
    end
  end
end
