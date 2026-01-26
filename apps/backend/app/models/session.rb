# == Schema Information
#
# Table name: sessions
#
#  id         :integer          not null, primary key
#  ip_address :string
#  token      :string           not null
#  user_agent :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :integer          not null
#
# Indexes
#
#  index_sessions_on_user_id  (user_id)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#

class Session < ApplicationRecord
  belongs_to :user
  before_create :generate_token

  def regenerate_token!
    generate_token
    save!
  end

  private
  def generate_token
    self.token = SecureRandom.hex(32)
  end
end
