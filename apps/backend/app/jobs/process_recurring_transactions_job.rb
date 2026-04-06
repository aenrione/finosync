class ProcessRecurringTransactionsJob < ApplicationJob
  def perform
    RecurringTransaction.auto_creatable.find_each do |recurring|
      recurring.create_auto_transaction!
    rescue => e
      Rails.logger.error("Failed to process recurring transaction #{recurring.id}: #{e.message}")
    end
  end
end
