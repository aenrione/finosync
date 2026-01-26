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
class BudgetListSerializer
  include JSONAPI::Serializer
  attributes :id, :title, :description
  attribute :total do |object|
    object.total.format
  end
  attribute :user_remaining do |object|
    object.user.remaining.format
  end
  attribute :expense_remaining do |object|
    (object.user.remaining - object.total).format
  end

  has_many :budget_items
end
