# == Schema Information
#
# Table name: tags
#
#  id         :integer          not null, primary key
#  color      :string
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :integer          not null
#
# Indexes
#
#  index_tags_on_user_id           (user_id)
#  index_tags_on_user_id_and_name  (user_id,name) UNIQUE
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
class Tag < ApplicationRecord
  belongs_to :user
  has_many :transaction_tags, dependent: :destroy
  has_many :transactions, through: :transaction_tags, source: :tagged_transaction

  validates :name, presence: true,
                   uniqueness: { scope: :user_id, case_sensitive: false }
end
