# == Schema Information
#
# Table name: transaction_tags
#
#  id             :integer          not null, primary key
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  tag_id         :integer          not null
#  transaction_id :integer          not null
#
# Indexes
#
#  index_transaction_tags_on_tag_id                     (tag_id)
#  index_transaction_tags_on_transaction_id             (transaction_id)
#  index_transaction_tags_on_transaction_id_and_tag_id  (transaction_id,tag_id) UNIQUE
#
# Foreign Keys
#
#  tag_id          (tag_id => tags.id)
#  transaction_id  (transaction_id => transactions.id)
#
class TransactionTag < ApplicationRecord
  belongs_to :tagged_transaction, class_name: "Transaction", foreign_key: :transaction_id
  belongs_to :tag

  validates :tag_id, uniqueness: { scope: :transaction_id }
end
