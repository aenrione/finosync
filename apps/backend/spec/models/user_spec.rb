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
require 'rails_helper'

RSpec.describe User, type: :model do
  it "has a valid factory" do
    user = build(:user)
    expect(user).to be_valid
  end
end
