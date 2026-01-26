class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  include DeviseTokenAuth::Concerns::User
  before_save -> { skip_confirmation! }

  has_paper_trail on: [:update],
                  only: [:balance, :income, :expense, :investments_return],
                  if: Proc.new { |t|
                        t.versions.length.zero? ? true : t.updated_at >= t.versions.last.created_at + 1.week
                      }

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_one :fintoc_account, dependent: :destroy
  has_one :fintual_account, dependent: :destroy
  has_one :buda_account, dependent: :destroy
  has_many :fintoc_bank_accounts, through: :fintoc_account, dependent: :destroy
  has_many :transaction_categories, dependent: :destroy
  has_many :to_buy_lists, dependent: :destroy
  monetize :balance, as: "balance_amount"
  monetize :income, as: "income_amount"
  monetize :expense, as: "expense_amount"
  monetize :investments_return, as: "investments_amount"
  monetize :quota, as: "quota_amount"

  def confirmation_required?
    false
  end

  def remaining
    (quota_amount - expense_amount.abs)
  end

  def transactions
    Transaction.where(fintoc_bank_account_id: fintoc_bank_accounts.pluck(:id).uniq)
  end
end

# == Schema Information
#
# Table name: users
#
#  id                     :bigint(8)        not null, primary key
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  reset_password_token   :string
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  confirmation_token     :string
#  confirmed_at           :datetime
#  confirmation_sent_at   :datetime
#  unconfirmed_email      :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  name                   :string           not null
#  balance                :decimal(14, 2)   default(0.0)
#  provider               :string           default("email"), not null
#  uid                    :string           default(""), not null
#  tokens                 :text
#  income                 :decimal(14, 2)   default(0.0)
#  expense                :decimal(14, 2)   default(0.0)
#  investments_return     :decimal(14, 2)   default(0.0)
#  quota                  :decimal(14, 2)   default(0.0)
#
# Indexes
#
#  index_users_on_confirmation_token    (confirmation_token) UNIQUE
#  index_users_on_email                 (email) UNIQUE
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#  index_users_on_uid_and_provider      (uid,provider) UNIQUE
#
