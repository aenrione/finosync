# == Schema Information
#
# Table name: feedbacks
#
#  id          :integer          not null, primary key
#  app_version :string
#  content     :text
#  device_info :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  user_id     :integer          not null
#
# Indexes
#
#  index_feedbacks_on_user_id  (user_id)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
FactoryBot.define do
  factory :feedback do
    user { nil }
    content { "MyText" }
    app_version { "MyString" }
    device_info { "MyString" }
  end
end
