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
class ShoppingItemSerializer
  include JSONAPI::Serializer

  attributes :id, :title, :description, :purchase_date, :purchased, :source_href,
             :created_at, :updated_at

  attribute :price do |object|
    object.price.to_f
  end

  attribute :formatted_price do |object|
    object.price_amount.format
  end

  attribute :transaction do |object|
    next if object.linked_transaction.blank?

    {
      id: object.linked_transaction.id,
      description: object.linked_transaction.description,
      amount: object.linked_transaction.amount.to_f,
      formatted_amount: object.linked_transaction.transaction_amount.format,
      transaction_date: object.linked_transaction.transaction_date,
      account_id: object.linked_transaction.account_id,
      category: if object.linked_transaction.transaction_category.present?
                   {
                     id: object.linked_transaction.transaction_category.id,
                     name: object.linked_transaction.transaction_category.name
                   }
                end
    }
  end
end
