# == Schema Information
#
# Table name: transactions
#
#  id                      :integer          not null, primary key
#  amount                  :decimal(14, 2)
#  comment                 :text
#  currency                :string
#  description             :string
#  holder_institution      :string
#  holder_name             :string
#  ignore                  :boolean          default(FALSE)
#  post_date               :date
#  transaction_date        :date
#  transaction_type        :string
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  account_id              :integer
#  holder_id               :string
#  transaction_category_id :integer
#  transaction_id          :string
#
# Indexes
#
#  index_transactions_on_account_id               (account_id)
#  index_transactions_on_transaction_category_id  (transaction_category_id)
#
# Foreign Keys
#
#  account_id               (account_id => accounts.id)
#  transaction_category_id  (transaction_category_id => transaction_categories.id)
#
FactoryBot.define do
  factory :transaction do
    amount do
      sign = [1, 1, 1, -1].sample
      value = Faker::Number.decimal(l_digits: 2, r_digits: 2).to_f
      (value * sign).round(2)
    end
    currency { "CLP" }
    description { Faker::Commerce.product_name }
    transaction_id { SecureRandom.hex(10) }
    post_date { Faker::Date.between(from: 2.years.ago, to: Date.today) }
    transaction_date { Faker::Date.between(from: 6.months.ago, to: Date.today) }
    transaction_type { ["deposit", "withdrawal", "transfer", "purchase", "sale"].sample }
    holder_name { Faker::Name.name }

    trait :expense do
      amount { -Faker::Number.between(from: 5_000, to: 150_000).round(2) }
      transaction_type { "purchase" }
      description do
        [
          "Uber Eats", "Starbucks", "Netflix", "Spotify", "Amazon", "Supermercado Lider",
          "Farmacia Ahumada", "Copec", "Shell", "Falabella", "Rappi", "iFood",
          "Electricity bill", "Water bill", "Internet Movistar", "Gym membership",
          "Doctor visit", "Uber ride", "Metro card", "Restaurant dinner"
        ].sample
      end
    end

    trait :income do
      amount { Faker::Number.between(from: 500_000, to: 3_000_000).round(2) }
      transaction_type { "deposit" }
      description do
        ["Salary deposit", "Freelance payment", "Investment return", "Refund", "Transfer received"].sample
      end
    end

    trait :recent do
      transaction_date { Faker::Date.between(from: 1.month.ago, to: Date.today) }
      post_date { transaction_date }
    end
  end
end
