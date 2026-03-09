# == Schema Information
#
# Table name: tags
#
#  id         :integer          not null, primary key
#  color      :string
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :integer          not null
#
# Indexes
#
#  index_tags_on_user_id           (user_id)
#  index_tags_on_user_id_and_name  (user_id,name) UNIQUE
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
require "rails_helper"

RSpec.describe Tag, type: :model do
  describe "validations" do
    it "requires a name" do
      tag = build(:tag, name: nil)
      expect(tag).not_to be_valid
    end

    it "requires unique name per user (case insensitive)" do
      user = create(:user)
      create(:tag, name: "food", user: user)
      duplicate = build(:tag, name: "Food", user: user)
      expect(duplicate).not_to be_valid
    end

    it "allows same name for different users" do
      tag1 = create(:tag, name: "food")
      tag2 = build(:tag, name: "food")
      expect(tag2).to be_valid
    end
  end

  describe "associations" do
    it "belongs to a user" do
      tag = create(:tag)
      expect(tag.user).to be_present
    end

    it "can have transactions through transaction_tags" do
      tag = create(:tag)
      account = create(:account, user: tag.user)
      transaction = create(:transaction, account: account)
      tag.transactions << transaction

      expect(tag.transactions).to include(transaction)
    end

    it "destroys transaction_tags when destroyed" do
      tag = create(:tag)
      account = create(:account, user: tag.user)
      transaction = create(:transaction, account: account)
      tag.transactions << transaction

      expect { tag.destroy }.to change(TransactionTag, :count).by(-1)
    end
  end
end
