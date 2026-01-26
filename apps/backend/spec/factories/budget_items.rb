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
FactoryBot.define do
  factory :budget_item do
    title { Faker::Commerce.product_name }
    description { "Description of the budget item" }
    price { Faker::Commerce.price(range: 10.0..500.0, as_string: true) }
    purchase_date { Date.today }
    purchased { false }
    source_href { Faker::Internet.url }

    association :budget_list

    trait :purchased do
      purchased { true }
      purchase_date { Date.today - rand(1..30).days }
    end
  end
end
