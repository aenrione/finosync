# == Schema Information
#
# Table name: buda_accounts
#
#  id                 :integer          not null, primary key
#  account_name       :string           default("Buda"), not null
#  api_key            :string           not null
#  balance            :decimal(14, 2)   default(0.0), not null
#  investments_return :decimal(14, 2)   default(0.0)
#  secret             :string           not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  user_id            :integer          not null
#
# Indexes
#
#  index_buda_accounts_on_user_id  (user_id)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
class BudaAccountSerializer 
  include JSONAPI::Serializer
  attributes :id, :account_name

  attribute :balance do |object|
    object.balance_amount.format
  end
  attribute :investments_return do |object|
    object.return_amount.format
  end
end


