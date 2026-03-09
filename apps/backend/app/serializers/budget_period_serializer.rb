# == Schema Information
#
# Table name: budget_periods
#
#  id         :integer          not null, primary key
#  month      :integer          not null
#  status     :integer          default("open"), not null
#  year       :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :integer          not null
#
# Indexes
#
#  index_budget_periods_on_user_id                     (user_id)
#  index_budget_periods_on_user_id_and_year_and_month  (user_id,year,month) UNIQUE
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
class BudgetPeriodSerializer
  include JSONAPI::Serializer
  attributes :id, :year, :month, :status

  attribute :start_date do |object|
    object.start_date.iso8601
  end

  attribute :end_date do |object|
    object.end_date.iso8601
  end
end
