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
class BudgetAllocationSerializer
  include JSONAPI::Serializer
  attributes :id, :planned_amount, :rollover_in, :notes, :transaction_category_id

  attribute :planned_amount do |object|
    object.planned_amount.to_f
  end

  attribute :rollover_in do |object|
    object.rollover_in.to_f
  end

  attribute :category_name do |object|
    object.transaction_category&.name
  end

  attribute :category_icon do |object|
    object.transaction_category&.icon || "FileQuestion"
  end
end
