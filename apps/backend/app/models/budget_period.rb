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
class BudgetPeriod < ApplicationRecord
  belongs_to :user
  has_many :budget_allocations, dependent: :destroy

  enum :status, { open: 0, closed: 1 }

  validates :year, presence: true
  validates :month, presence: true, inclusion: { in: 1..12 }
  validates :month, uniqueness: { scope: [ :user_id, :year ] }

  def start_date
    Date.new(year, month, 1)
  end

  def end_date
    start_date.end_of_month
  end
end
