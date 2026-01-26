class Transaction < ApplicationRecord
  belongs_to :account
  belongs_to :transaction_category, optional: true
  monetize :amount, as: "transaction_amount"
end

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
