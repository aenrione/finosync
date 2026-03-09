# == Schema Information
#
# Table name: recurring_transactions
#
#  id                      :integer          not null, primary key
#  amount                  :decimal(14, 2)   not null
#  auto_create             :boolean          default(FALSE), not null
#  currency                :string           default("CLP"), not null
#  end_date                :date
#  frequency               :integer          default("weekly"), not null
#  is_active               :boolean          default(TRUE), not null
#  name                    :string           not null
#  next_due_date           :date             not null
#  notes                   :string
#  start_date              :date             not null
#  transaction_type        :integer          default("expense"), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  account_id              :integer
#  transaction_category_id :integer
#  user_id                 :integer          not null
#
# Indexes
#
#  index_recurring_transactions_on_account_id               (account_id)
#  index_recurring_transactions_on_transaction_category_id  (transaction_category_id)
#  index_recurring_transactions_on_user_id                  (user_id)
#
# Foreign Keys
#
#  account_id               (account_id => accounts.id)
#  transaction_category_id  (transaction_category_id => transaction_categories.id)
#  user_id                  (user_id => users.id)
#
FactoryBot.define do
  factory :recurring_transaction do
    name { Faker::Commerce.product_name }
    amount { Faker::Number.between(from: 1000, to: 100_000) }
    currency { "CLP" }
    frequency { :monthly }
    start_date { Date.today }
    next_due_date { Date.today + 1.month }
    is_active { true }
    transaction_type { :expense }
    auto_create { false }
    user

    trait :auto_create do
      auto_create { true }
      account
    end

    trait :income do
      transaction_type { :income }
    end

    trait :inactive do
      is_active { false }
    end

    trait :due_today do
      next_due_date { Date.today }
    end

    trait :with_category do
      transaction_category
    end
  end
end
