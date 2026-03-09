# == Schema Information
#
# Table name: category_groups
#
#  id            :integer          not null, primary key
#  display_order :integer          default(0), not null
#  group_type    :integer          default("income"), not null
#  name          :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  user_id       :integer          not null
#
# Indexes
#
#  index_category_groups_on_user_id           (user_id)
#  index_category_groups_on_user_id_and_name  (user_id,name) UNIQUE
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
class CategoryGroup < ApplicationRecord
  belongs_to :user
  has_many :transaction_categories, dependent: :nullify

  enum :group_type, { income: 0, expense: 1, savings: 2, debt: 3 }

  validates :name, presence: true, uniqueness: { scope: :user_id }

  default_scope { order(:display_order) }
end
