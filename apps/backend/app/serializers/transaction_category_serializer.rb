# == Schema Information
#
# Table name: transaction_categories
#
#  id                :integer          not null, primary key
#  description       :text
#  icon              :string           default("FileQuestion")
#  is_income         :boolean          default(FALSE)
#  name              :string
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  category_group_id :integer
#  user_id           :integer          not null
#
# Indexes
#
#  index_transaction_categories_on_category_group_id  (category_group_id)
#  index_transaction_categories_on_user_id            (user_id)
#
# Foreign Keys
#
#  category_group_id  (category_group_id => category_groups.id)
#  user_id            (user_id => users.id)
#
class TransactionCategorySerializer 
  include JSONAPI::Serializer
  attributes :description, :name, :id, :icon, :category_group_id, :is_income

  attribute :transaction_count do |object|
    object.transactions.count
  end

end
