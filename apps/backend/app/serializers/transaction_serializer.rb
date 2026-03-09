# == Schema Information
#
# Table name: transactions
#
#  id                      :integer          not null, primary key
#  amount                  :decimal(14, 2)
#  comment                 :text
#  currency                :string
#  description             :string
#  holder_institution      :string
#  holder_name             :string
#  ignore                  :boolean          default(FALSE)
#  post_date               :date
#  transaction_date        :date
#  transaction_type        :string
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  account_id              :integer
#  holder_id               :string
#  transaction_category_id :integer
#  transaction_id          :string
#
# Indexes
#
#  index_transactions_on_account_id               (account_id)
#  index_transactions_on_transaction_category_id  (transaction_category_id)
#
# Foreign Keys
#
#  account_id               (account_id => accounts.id)
#  transaction_category_id  (transaction_category_id => transaction_categories.id)
#
class TransactionSerializer
  include JSONAPI::Serializer
  attributes :id, :description, :holder_id, :holder_name, :holder_institution,
             :transaction_date, :currency, :comment, :account_id, :post_date,
             :transaction_category_id, :transaction_type, :ignore, :created_at,
             :updated_at

  attribute :amount do |object|
    object.amount.to_f
  end

  attribute :formatted_amount do |object|
    object.transaction_amount.format
  end

  attribute :icon do |object|
    object.transaction_category&.icon || "FileQuestion"
  end

  attribute :category do |object|
   if object.transaction_category.present?
      {
        name: object.transaction_category.name,
        id: object.transaction_category.id
      }
   else
     nil
   end
  end

  attribute :tags do |object|
    object.tags.map { |tag| { id: tag.id, name: tag.name, color: tag.color } }
  end
end
