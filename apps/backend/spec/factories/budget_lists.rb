# == Schema Information
#
# Table name: budget_lists
#
#  id           :integer          not null, primary key
#  description  :string
#  end_date     :date
#  start_date   :date
#  title        :string
#  total_budget :decimal(14, 2)   default(0.0), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  user_id      :integer          not null
#
# Indexes
#
#  index_budget_lists_on_user_id  (user_id)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
FactoryBot.define do
  factory :budget_list do
    title { "Monthly Budget - #{Date.today.strftime('%B %Y')}" }
    description { "Budget for the month of #{Date.today.strftime('%B %Y')}" }
    start_date { Date.today.beginning_of_month }
    end_date { Date.today.end_of_month }
    total_budget { 1000.00 }

    association :user

    trait :with_items do
      after(:create) do |budget_list|
        create_list(:budget_item, 3, budget_list: budget_list)
      end
    end
  end
end
