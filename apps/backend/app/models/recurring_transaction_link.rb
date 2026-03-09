class RecurringTransactionLink < ApplicationRecord
  belongs_to :recurring_transaction
  belongs_to :linked_transaction, class_name: "Transaction", foreign_key: :transaction_id

  validates :transaction_id, uniqueness: { scope: :recurring_transaction_id }
end
