# == Schema Information
#
# Table name: fintoc_accounts
#
#  id           :integer          not null, primary key
#  account_name :string           default("Fintoc"), not null
#  balance      :decimal(14, 2)   default(0.0), not null
#  expense      :decimal(14, 2)   default(0.0)
#  income       :decimal(14, 2)   default(0.0)
#  link         :string           not null
#  secret       :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  user_id      :integer          not null
#
# Indexes
#
#  index_fintoc_accounts_on_user_id  (user_id)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
class FintocAccountSerializer 
  include JSONAPI::Serializer
  attributes :id, :account_name

  attribute :balance do |object|
    object.balance_amount.format
  end

  attribute :income do |object|
    object.income_amount.format
  end
  attribute :expense do |object|
    object.expense_amount.format
  end
end

