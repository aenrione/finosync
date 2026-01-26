# == Schema Information
#
# Table name: account_assets
#
#  id            :integer          not null, primary key
#  creation_date :date
#  currency      :string           default("CLP"), not null
#  current       :decimal(14, 2)
#  deposited     :decimal(14, 2)
#  frozen_asset  :decimal(14, 2)
#  name          :string           not null
#  pending       :decimal(14, 2)
#  profit        :decimal(14, 2)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  account_id    :integer
#
# Indexes
#
#  index_account_assets_on_account_id  (account_id)
#
# Foreign Keys
#
#  account_id  (account_id => accounts.id)
#
FactoryBot.define do
  factory :account_asset do
    name { Faker::Company.name }
    creation_date { Date.today }
    currency { "CLP" }
    current { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    deposited { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    frozen_asset { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    pending { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    profit { Faker::Number.decimal(l_digits: 2, r_digits: 2) }

    association :account
  end
end
