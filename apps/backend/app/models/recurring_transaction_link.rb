# == Schema Information
#
# Table name: recurring_transaction_links
#
#  id                       :integer          not null, primary key
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  recurring_transaction_id :integer          not null
#  transaction_id           :integer          not null
#
# Indexes
#
#  idx_recurring_tx_links_unique                                  (recurring_transaction_id,transaction_id) UNIQUE
#  index_recurring_transaction_links_on_recurring_transaction_id  (recurring_transaction_id)
#  index_recurring_transaction_links_on_transaction_id            (transaction_id)
#
# Foreign Keys
#
#  recurring_transaction_id  (recurring_transaction_id => recurring_transactions.id)
#  transaction_id            (transaction_id => transactions.id)
#
class RecurringTransactionLink < ApplicationRecord
  belongs_to :recurring_transaction
  belongs_to :linked_transaction, class_name: "Transaction", foreign_key: :transaction_id

  validates :transaction_id, uniqueness: { scope: :recurring_transaction_id }
end
