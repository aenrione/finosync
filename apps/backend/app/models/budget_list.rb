# == Schema Information
#
# Table name: budget_lists
#
#  id           :integer          not null, primary key
#  description  :string
#  end_date     :date
#  start_date   :date
#  title        :string
#  total_budget :decimal(14, 2)   default(0.0), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  user_id      :integer          not null
#
# Indexes
#
#  index_budget_lists_on_user_id  (user_id)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
class BudgetList < ApplicationRecord
  has_many :budget_items, dependent: :destroy
  alias_method :items, :budget_items
  belongs_to :user

  def total
    amount = Money.new(0)
    items.each { |i| amount += i.price_amount }
    amount
  end
end
