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
  end
end
