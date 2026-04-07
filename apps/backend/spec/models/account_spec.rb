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
#  session_expires_at :datetime
#  session_token      :string
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
require 'rails_helper'

RSpec.describe Account, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
