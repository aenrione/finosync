class RecurringTransaction < ApplicationRecord
  belongs_to :user
  belongs_to :transaction_category, optional: true
  belongs_to :account, optional: true
  has_many :recurring_transaction_links, dependent: :destroy
  has_many :transactions, through: :recurring_transaction_links, source: :linked_transaction

  monetize :amount, as: "recurring_amount"

  enum :frequency, { weekly: 0, biweekly: 1, monthly: 2, quarterly: 3, semi_annually: 4, annually: 5 }
  enum :transaction_type, { expense: 0, income: 1 }, prefix: :type

  validates :name, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :start_date, presence: true
  validates :next_due_date, presence: true
  validates :account, presence: true, if: :auto_create?

  scope :active, -> { where(is_active: true) }
  scope :upcoming, ->(days = 30) { active.where(next_due_date: ..Date.today + days.days) }
  scope :auto_creatable, -> { active.where(auto_create: true).where(next_due_date: ..Date.today) }

  def advance_next_due_date!
    interval = case frequency
               when "weekly" then 1.week
               when "biweekly" then 2.weeks
               when "monthly" then 1.month
               when "quarterly" then 3.months
               when "semi_annually" then 6.months
               when "annually" then 1.year
               end

    new_date = next_due_date + interval

    if end_date.present? && new_date > end_date
      update!(is_active: false)
    else
      update!(next_due_date: new_date)
    end
  end

  def create_auto_transaction!
    return unless auto_create? && account.present?

    tx = Transaction.create!(
      account: account,
      description: name,
      amount: type_expense? ? -amount : amount,
      currency: currency,
      transaction_date: next_due_date,
      post_date: next_due_date,
      transaction_category: transaction_category,
      comment: "Auto-created from recurring: #{name}"
    )

    recurring_transaction_links.create!(linked_transaction: tx)
    advance_next_due_date!
    tx
  end
end
