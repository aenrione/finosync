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
class TagSerializer
  include JSONAPI::Serializer
  attributes :id, :name, :color

  attribute :transaction_count do |tag|
    tag.transactions.count
  end
end
