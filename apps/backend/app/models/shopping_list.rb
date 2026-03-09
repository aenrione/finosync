# == Schema Information
#
# Table name: shopping_lists
#
#  id                   :integer          not null, primary key
#  description          :string
#  end_date             :date
#  start_date           :date
#  title                :string
#  total_budget         :decimal(14, 2)   default(0.0), not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  budget_allocation_id :integer
#  user_id              :integer          not null
#
# Indexes
#
#  index_shopping_lists_on_budget_allocation_id  (budget_allocation_id)
#  index_shopping_lists_on_user_id               (user_id)
#
# Foreign Keys
#
#  budget_allocation_id  (budget_allocation_id => budget_allocations.id)
#  user_id               (user_id => users.id)
#
class ShoppingList < ApplicationRecord
  has_many :shopping_items, dependent: :destroy
  alias_method :items, :shopping_items
  belongs_to :user
  belongs_to :budget_allocation, optional: true

  validate :budget_allocation_belongs_to_user

  def total
    amount = Money.new(0)
    items.each { |i| amount += i.price_amount }
    amount
  end

  private

  def budget_allocation_belongs_to_user
    return if budget_allocation.blank?
    return if budget_allocation.budget_period.user_id == user_id

    errors.add(:budget_allocation, "must belong to the current user")
  end
end
