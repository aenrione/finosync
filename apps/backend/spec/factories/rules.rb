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
FactoryBot.define do
  factory :rule do
    user
    sequence(:name) { |n| "Rule #{n}" }
    enabled { true }
    sequence(:priority) { |n| n }
    overwrite_mode { "fill_blanks" }
    conditions do
      {
        logic: "and",
        children: [
          {
            field: "merchant",
            operator: "contains",
            value: "amazon"
          }
        ]
      }
    end
    actions do
      [
        {
          type: "add_tags",
          tag_ids: [ create(:tag, user: user).id ]
        }
      ]
    end
  end
end
