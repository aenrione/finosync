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
class ShoppingListSerializer
  include JSONAPI::Serializer
  attributes :id, :title, :description, :total_budget, :start_date, :end_date,
             :created_at, :updated_at

  attribute :total do |object|
    object.total.to_f
  end

  attribute :formatted_total do |object|
    object.total.format
  end

  attribute :formatted_total_budget do |object|
    Money.from_amount(object.total_budget.to_f).format
  end

  attribute :user_remaining do |object|
    object.user.remaining.format
  end
  attribute :expense_remaining do |object|
    (object.user.remaining - object.total).format
  end

  attribute :items do |object|
    object.items.order(created_at: :desc).map do |item|
      ShoppingItemSerializer.new(item).serializable_hash.dig(:data, :attributes)
    end
  end

  attribute :item_count do |object|
    object.items.count
  end

  attribute :purchased_count do |object|
    object.items.where(purchased: true).count
  end

  attribute :budget_allocation do |object|
    allocation = object.budget_allocation
    next if allocation.blank?

    {
      id: allocation.id,
      planned_amount: allocation.planned_amount.to_f,
      rollover_in: allocation.rollover_in.to_f,
      notes: allocation.notes,
      transaction_category_id: allocation.transaction_category_id,
      category_name: allocation.transaction_category.name,
      category_icon: allocation.transaction_category.icon || "FileQuestion",
      budget_period_id: allocation.budget_period_id,
      budget_period_year: allocation.budget_period.year,
      budget_period_month: allocation.budget_period.month
    }
  end
end
