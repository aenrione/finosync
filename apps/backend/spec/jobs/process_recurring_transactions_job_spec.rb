require "rails_helper"

RSpec.describe ProcessRecurringTransactionsJob, type: :job do
  describe "#perform" do
    it "does not fail when no auto-creatable records exist" do
      expect { ProcessRecurringTransactionsJob.new.perform }.not_to raise_error
    end
  end
end
