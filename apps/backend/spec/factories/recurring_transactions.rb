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
