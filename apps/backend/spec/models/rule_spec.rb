# == Schema Information
#
# Table name: rules
#
#  id                     :integer          not null, primary key
#  actions                :json             not null
#  conditions             :json             not null
#  description            :text
#  enabled                :boolean          default(TRUE), not null
#  last_error             :text
#  last_run_at            :datetime
#  last_run_matched_count :integer          default(0), not null
#  last_run_status        :string
#  last_run_updated_count :integer          default(0), not null
#  name                   :string           not null
#  overwrite_mode         :string           default("fill_blanks"), not null
#  priority               :integer          default(0), not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  user_id                :integer          not null
#
# Indexes
#
#  index_rules_on_user_id               (user_id)
#  index_rules_on_user_id_and_priority  (user_id,priority)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
require "rails_helper"

RSpec.describe Rule, type: :model do
  describe "validations" do
    it "is valid with nested conditions and actions" do
      user = create(:user)
      category = create(:transaction_category, user: user)
      tag = create(:tag, user: user)

      rule = build(
        :rule,
        user: user,
        conditions: {
          logic: "or",
          children: [
            {
              field: "merchant",
              operator: "contains",
              value: "amazon"
            },
            {
              field: "transaction_category_id",
              operator: "eq",
              value: category.id
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
          }
        ]
      )

      expect(rule).to be_valid
    end

    it "requires supported condition fields" do
      rule = build(:rule, conditions: { field: "bad_field", operator: "eq", value: "x" })

      expect(rule).not_to be_valid
      expect(rule.errors[:conditions]).to include("contains an unsupported field")
    end

    it "requires referenced resources to belong to the user" do
      user = create(:user)
      other_category = create(:transaction_category, user: create(:user))

      rule = build(
        :rule,
        user: user,
        actions: [
          {
            type: "assign_category",
            transaction_category_id: other_category.id
          }
        ]
      )

      expect(rule).not_to be_valid
      expect(rule.errors[:base]).to include("category must belong to user")
    end
  end
end
