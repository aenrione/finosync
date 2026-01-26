# == Schema Information
#
# Table name: budget_items
#
#  id             :integer          not null, primary key
#  description    :string
#  price          :decimal(14, 2)
#  purchase_date  :date
#  purchased      :boolean          default(FALSE)
#  source_href    :string
#  title          :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  budget_list_id :integer          not null
#
# Indexes
#
#  index_budget_items_on_budget_list_id  (budget_list_id)
#
# Foreign Keys
#
#  budget_list_id  (budget_list_id => budget_lists.id)
#
class BudgetItemSerializer 
  include JSONAPI::Serializer
  attributes :id, :title, :description
  attribute :price do |object|
    object.price_amount.format
  end
end
