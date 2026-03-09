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
require "rails_helper"

RSpec.describe TransactionTag, type: :model do
  describe "validations" do
    it "prevents duplicate tag-transaction pairs" do
      tag = create(:tag)
      account = create(:account, user: tag.user)
      transaction = create(:transaction, account: account)

      TransactionTag.create!(tag: tag, tagged_transaction: transaction)
      duplicate = TransactionTag.new(tag: tag, tagged_transaction: transaction)

      expect(duplicate).not_to be_valid
    end
  end
end
