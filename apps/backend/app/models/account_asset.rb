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
class AccountAsset < ApplicationRecord
  belongs_to :account
  has_one :user, through: :account
  monetize :current, as: "current_amount"
  monetize :deposited, as: "deposited_amount"
  monetize :profit, as: "profit_amount"
  monetize :pending, as: "pending_amount"
  monetize :frozen_asset, as: "frozen_amount"
end
