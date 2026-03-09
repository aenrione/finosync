require "rails_helper"

RSpec.describe Rules::ApplyFirstMatchingRule do
  describe "#call" do
    it "applies the first matching rule with all of its actions" do
      user = create(:user)
      account = create(:account, user: user)
      category = create(:transaction_category, user: user, name: "Shopping")
      tag = create(:tag, user: user, name: "online")
      recurring_transaction = create(:recurring_transaction, user: user, name: "Amazon Prime")
      transaction = create(:transaction, account: account, description: "Amazon Marketplace")

      matching_rule = create(
        :rule,
        user: user,
        priority: 0,
        conditions: {
          logic: "and",
          children: [
            {
              field: "merchant",
              operator: "contains",
              value: "amazon"
            }
          ]
        },
        actions: [
          {
            type: "assign_category",
            transaction_category_id: category.id
          },
          {
            type: "add_tags",
            tag_ids: [ tag.id ]
          },
          {
            type: "link_recurring_transaction",
            recurring_transaction_id: recurring_transaction.id
          }
        ]
      )

      create(
        :rule,
        user: user,
        priority: 1,
        conditions: {
          logic: "and",
          children: [
            {
              field: "merchant",
              operator: "contains",
              value: "amazon"
            }
          ]
        },
        actions: [
          {
            type: "assign_category",
            transaction_category_id: create(:transaction_category, user: user, name: "Other").id
          }
        ]
      )

      result = described_class.new(transaction: transaction).call

      expect(result.rule).to eq(matching_rule)
      expect(result.matched_count).to eq(1)
      expect(transaction.reload.transaction_category).to eq(category)
      expect(transaction.tags).to include(tag)
      expect(transaction.recurring_transaction_links.count).to eq(1)
      expect(transaction.recurring_transaction_links.first.recurring_transaction).to eq(recurring_transaction)
    end
  end
end
