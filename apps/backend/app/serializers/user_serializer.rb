# == Schema Information
#
# Table name: users
#
#  id                 :integer          not null, primary key
#  balance            :decimal(14, 2)   default(0.0)
#  email_address      :string           not null
#  expense            :decimal(14, 2)   default(0.0)
#  income             :decimal(14, 2)   default(0.0)
#  investments_return :decimal(14, 2)   default(0.0)
#  name               :string           not null
#  password_digest    :string           not null
#  quota              :decimal(14, 2)   default(0.0)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_users_on_email_address  (email_address) UNIQUE
#
class UserSerializer
  include JSONAPI::Serializer

  attributes :email, :name

  attribute :balances do |object|
    temp = {}
    object.accounts.each do |account|
      if account.balance_amount
        temp[account.account_name] = account.balance_amount.format
      end
    end
    temp[:total] = object.balance_amount.format
    temp
  end

  attribute :income do |object|
    object.income_amount.format
  end
  attribute :quota do |object|
    object.quota_amount.format
  end
  attribute :remaining do |object|
    object.remaining.format
  end
  attribute :expense do |object|
    object.expense_amount.format
  end
  attribute :investments_return do |object|
    object.investments_amount.format
  end
end
