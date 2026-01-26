# == Schema Information
#
# Table name: transaction_categories
#
#  id          :integer          not null, primary key
#  description :text
#  icon        :string           default("FileQuestion")
#  name        :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  user_id     :integer          not null
#
# Indexes
#
#  index_transaction_categories_on_user_id  (user_id)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
FactoryBot.define do
  factory :transaction_category do
    sequence(:name) { |n| "Category #{n}" }
  end
end
