# == Schema Information
#
# Table name: accounts
#
#  id                 :integer          not null, primary key
#  account_name       :string           default("Local"), not null
#  account_type       :integer          default("local"), not null
#  balance            :decimal(14, 2)   default(0.0), not null
#  currency           :string           default("CLP"), not null
#  expense            :decimal(14, 2)   default(0.0)
#  income             :decimal(14, 2)   default(0.0)
#  investments_return :decimal(14, 2)   default(0.0)
#  primary_key        :string           not null
#  secret             :string
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  user_id            :integer          not null
#
# Indexes
#
#  index_accounts_on_user_id  (user_id)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
FactoryBot.define do
  factory :account do
    account_name { Faker::Bank.name }
    primary_key { SecureRandom.hex(10) }
    secret { SecureRandom.hex(10) }
    balance { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    income { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    expense { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    investments_return { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    currency { ["CLP", "USD", "EUR", "BTC"].sample }

    association :user

    trait :fintoc do
      account_type { :fintoc }
      account_name { Faker::Bank.name }
      primary_key { "fintoc_account_#{SecureRandom.hex(5)}" }
      secret { SecureRandom.hex(10) }
    end

    trait :fintual do
      account_type { :fintual }
      account_name { "Fintual #{Faker::Bank.name}" }
      primary_key { "fintual_account_#{SecureRandom.hex(5)}" }
      secret { SecureRandom.hex(10) }
    end

    trait :buda do
      account_type { :buda }
      account_name { "Buda #{Faker::Bank.name}" }
      primary_key { "buda_account_#{SecureRandom.hex(5)}" }
      secret { SecureRandom.hex(10) }
    end

    trait :with_transactions do
      after(:create) do |account|
        create_list(:transaction, 5, account: account)
      end
    end
  end
end
