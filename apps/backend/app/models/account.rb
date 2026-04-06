# == Schema Information
#
# Table name: accounts
#
#  id                 :integer          not null, primary key
#  account_name       :string           default("Local"), not null
#  account_type       :integer          default("local"), not null
#  balance            :decimal(14, 2)   default(0.0), not null
#  currency           :string           default("CLP"), not null
#  expense            :decimal(14, 2)   default(0.0)
#  income             :decimal(14, 2)   default(0.0)
#  investments_return :decimal(14, 2)   default(0.0)
#  primary_key        :string           not null
#  secret             :string
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  user_id            :integer          not null
#
# Indexes
#
#  index_accounts_on_user_id  (user_id)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
class Account < ApplicationRecord
  belongs_to :user
  has_many :account_assets, dependent: :destroy
  has_many :transactions, dependent: :destroy
  monetize :balance, as: "balance_amount"
  monetize :investments_return, as: "return_amount"
  monetize :income, as: "income_amount"
  monetize :expense, as: "expense_amount"

  has_paper_trail on: [ :update ],
                  only: [ :balance, :investments_return, :income, :expense ]

  enum :account_type, { local: 0, fintoc: 1, fintual: 2, buda: 3 }

  encrypts :primary_key, deterministic: false

  validates :account_name, presence: true
  validates :primary_key, presence: true, unless: :local?
  validates :secret, presence: true, unless: -> { local? || fintoc? }
  validate :validate_api, on: :create

  before_create :set_default_credentials_for_local

  def editable?
    local?
  end

  private

  def set_default_credentials_for_local
    if local?
      self.primary_key = SecureRandom.hex(10)
      self.secret = SecureRandom.hex(10)
    end
  end

  def validate_api
    if Rails.env.production?
      case account_type
      when "fintoc"
        fintoc_validate
      when "buda"
        buda_validate
      else
        ""
      end
    end
  end

  def fintoc_validate
    ValidateFintocAccount.for(fintoc_account: self)
  rescue Fintoc::Errors::InvalidApiKeyError
    errors.add(:secret, "Invalida")
  rescue Fintoc::Errors::InvalidLinkTokenError
    errors.add(:primary_key, "Invalido")
  end

  def buda_validate
    ValidateBudaAccount.for(buda_account: self)
  rescue Buda::Errors::InvalidApiKeyError
    errors.add(:secret, "Invalida")
  rescue Buda::Errors::InvalidLinkTokenError
    errors.add(:primary_key, "Invalido")
  end
end
