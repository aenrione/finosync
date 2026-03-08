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
class AccountSerializer
  include JSONAPI::Serializer
  
  attributes :id, :account_name, :currency, :account_type, :created_at, :updated_at

  attribute :balance do |object|
    object.balance_amount.format
  end

  attribute :income do |object|
    object.income_amount.format
  end
  
  attribute :expense do |object|
    object.expense_amount.format
  end

  attribute :investments_return do |object|
    object.return_amount.format
  end

  attribute :editable do |object|
    object.editable?
  end

  # Raw amounts for calculations (returns Money objects)
  attribute :balance_cents do |object|
    object.balance_amount.cents
  end

  attribute :income_cents do |object|
    object.income_amount.cents
  end

  attribute :expense_cents do |object|
    object.expense_amount.cents
  end
end
