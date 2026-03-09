# == Schema Information
#
# Table name: shopping_items
#
#  id               :integer          not null, primary key
#  description      :string
#  price            :decimal(14, 2)
#  purchase_date    :date
#  purchased        :boolean          default(FALSE)
#  source_href      :string
#  title            :string
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  shopping_list_id :integer          not null
#  transaction_id   :integer
#
# Indexes
#
#  index_shopping_items_on_shopping_list_id  (shopping_list_id)
#  index_shopping_items_on_transaction_id    (transaction_id)
#
# Foreign Keys
#
#  shopping_list_id  (shopping_list_id => shopping_lists.id)
#  transaction_id    (transaction_id => transactions.id)
#
FactoryBot.define do
  factory :shopping_item do
    title { Faker::Commerce.product_name }
    description { "Description of the shopping item" }
    price { Faker::Commerce.price(range: 10.0..500.0, as_string: true) }
    purchase_date { Date.today }
    purchased { false }
    source_href { Faker::Internet.url }

    association :shopping_list

    trait :purchased do
      purchased { true }
      purchase_date { Date.today - rand(1..30).days }
    end
  end
end
