require "rails_helper"

RSpec.describe ProcessRecurringTransactionsJob, type: :job do
  describe "#perform" do
    it "processes auto-creatable recurring transactions" do
      # Stub the scope to return an empty relation to verify it's called
      scope = RecurringTransaction.none
      allow(RecurringTransaction).to receive(:auto_creatable).and_return(scope)

      described_class.new.perform

      expect(RecurringTransaction).to have_received(:auto_creatable)
    end

    it "logs errors for individual failures without stopping" do
      recurring = instance_double(RecurringTransaction, id: 1)
      scope = double("scope")
      allow(RecurringTransaction).to receive(:auto_creatable).and_return(scope)
      allow(scope).to receive(:find_each).and_yield(recurring)
      allow(recurring).to receive(:create_auto_transaction!).and_raise(StandardError.new("fail"))

      expect(Rails.logger).to receive(:error).with(/Failed to process recurring transaction 1/)

      described_class.new.perform
    end
  end
end
