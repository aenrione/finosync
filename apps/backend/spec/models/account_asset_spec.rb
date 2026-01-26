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
require 'rails_helper'

RSpec.describe AccountAsset, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
