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
class CategoryGroupSerializer
  include JSONAPI::Serializer
  attributes :id, :name, :display_order, :group_type

  attribute :categories do |object|
    object.transaction_categories.map do |cat|
      TransactionCategorySerializer.new(cat).serializable_hash.dig(:data, :attributes)
    end
  end
end
