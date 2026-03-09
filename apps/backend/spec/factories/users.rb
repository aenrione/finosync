# == Schema Information
#
# Table name: users
#
#  id                   :integer          not null, primary key
#  balance              :decimal(14, 2)   default(0.0)
#  email_address        :string           not null
#  expense              :decimal(14, 2)   default(0.0)
#  financial_goals      :text
#  income               :decimal(14, 2)   default(0.0)
#  investments_return   :decimal(14, 2)   default(0.0)
#  monthly_income       :decimal(14, 2)   default(0.0)
#  name                 :string           not null
#  onboarding_completed :boolean          default(FALSE)
#  password_digest      :string           not null
#  preferred_currency   :string
#  quota                :decimal(14, 2)   default(0.0)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_users_on_email_address  (email_address) UNIQUE
#
FactoryBot.define do
  factory :user do
    email_address { Faker::Internet.email }
    password { Faker::Internet.password(min_length: 8) }
    name { Faker::Name.name }
  end
end
