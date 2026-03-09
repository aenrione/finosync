# == Schema Information
#
# Table name: recurring_transactions
#
#  id                      :integer          not null, primary key
#  amount                  :decimal(14, 2)   not null
#  auto_create             :boolean          default(FALSE), not null
#  currency                :string           default("CLP"), not null
#  end_date                :date
#  frequency               :integer          default("weekly"), not null
#  is_active               :boolean          default(TRUE), not null
#  name                    :string           not null
#  next_due_date           :date             not null
#  notes                   :string
#  start_date              :date             not null
#  transaction_type        :integer          default("expense"), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  account_id              :integer
#  transaction_category_id :integer
#  user_id                 :integer          not null
#
# Indexes
#
#  index_recurring_transactions_on_account_id               (account_id)
#  index_recurring_transactions_on_transaction_category_id  (transaction_category_id)
#  index_recurring_transactions_on_user_id                  (user_id)
#
# Foreign Keys
#
#  account_id               (account_id => accounts.id)
#  transaction_category_id  (transaction_category_id => transaction_categories.id)
#  user_id                  (user_id => users.id)
#
class RecurringTransactionSerializer
  include JSONAPI::Serializer
  attributes :id, :name, :currency, :frequency, :start_date, :end_date,
             :next_due_date, :is_active, :transaction_type, :auto_create,
             :notes, :transaction_category_id, :account_id,
             :created_at, :updated_at

  attribute :amount do |object|
    object.amount.to_f
  end

  attribute :formatted_amount do |object|
    object.recurring_amount.format
  end

  attribute :account_name do |object|
    object.account&.account_name
  end

  attribute :category do |object|
    if object.transaction_category.present?
      {
        id: object.transaction_category.id,
        name: object.transaction_category.name
      }
    end
  end

  attribute :linked_transaction_count do |object|
    object.recurring_transaction_links.count
  end
end
