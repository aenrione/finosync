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
class BudgetAllocation < ApplicationRecord
  belongs_to :budget_period
  belongs_to :transaction_category
  has_many :shopping_lists, dependent: :nullify

  validates :transaction_category_id, uniqueness: { scope: :budget_period_id }
  validates :planned_amount, numericality: { greater_than_or_equal_to: 0 }
end
