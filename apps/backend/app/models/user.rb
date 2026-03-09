# == Schema Information
#
# Table name: users
#
#  id                   :integer          not null, primary key
#  balance              :decimal(14, 2)   default(0.0)
#  email_address        :string           not null
#  expense              :decimal(14, 2)   default(0.0)
#  financial_goals      :text
#  income               :decimal(14, 2)   default(0.0)
#  investments_return   :decimal(14, 2)   default(0.0)
#  monthly_income       :decimal(14, 2)   default(0.0)
#  name                 :string           not null
#  onboarding_completed :boolean          default(FALSE)
#  password_digest      :string           not null
#  preferred_currency   :string
#  quota                :decimal(14, 2)   default(0.0)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_users_on_email_address  (email_address) UNIQUE
#
class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy

  has_many :accounts, dependent: :destroy
  has_many :transactions, through: :accounts, dependent: :destroy
  has_many :transaction_categories, dependent: :destroy
  alias_method :categories, :transaction_categories
  has_many :shopping_lists, dependent: :destroy
  has_many :tags, dependent: :destroy
  has_many :recurring_transactions, dependent: :destroy
  has_many :rules, dependent: :destroy
  has_many :category_groups, dependent: :destroy
  has_many :budget_periods, dependent: :destroy
  has_many :feedbacks, dependent: :destroy

  monetize :balance, as: "balance_amount"
  monetize :income, as: "income_amount"
  monetize :expense, as: "expense_amount"
  monetize :investments_return, as: "investments_amount"
  monetize :quota, as: "quota_amount"
  monetize :monthly_income, as: "monthly_income_amount"

  serialize :financial_goals, coder: JSON

  validates :preferred_currency, length: { maximum: 5 }, allow_nil: true

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  has_paper_trail on: [ :update ],
                  only: [ :balance, :income, :expense, :investments_return ]
  # if: Proc.new { |t|
  #       t.versions.length.zero? ? true : t.updated_at >= t.versions.last.created_at + 1.week
  #     }
  def balances
    GetUserBalances.for(user: self)
  end

  def email
    email_address
  end

  def confirmation_required?
    false
  end

  def remaining
    (quota_amount - expense_amount.abs)
  end
end
