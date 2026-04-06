require "rails_helper"

RSpec.describe FetchAccountDataJob, type: :job do
  let(:user) { create(:user) }

  describe "#perform" do
    it "calls UpdateBudaAccountInformation for buda accounts" do
      account = create(:account, :buda, user: user)
      expect(UpdateBudaAccountInformation).to receive(:for).with(buda_account: account)

      described_class.new.perform(account.id)
    end

    it "calls UpdateFintocAccountInformation for fintoc accounts" do
      account = create(:account, :fintoc, user: user)
      expect(UpdateFintocAccountInformation).to receive(:for).with(account: account)

      described_class.new.perform(account.id)
    end

    it "calls UpdateFintualAccountInformation for fintual accounts" do
      account = create(:account, :fintual, user: user)
      expect(UpdateFintualAccountInformation).to receive(:for).with(fintual_account: account)

      described_class.new.perform(account.id)
    end

    it "does nothing for local accounts" do
      account = create(:account, user: user)
      expect(UpdateBudaAccountInformation).not_to receive(:for)
      expect(UpdateFintocAccountInformation).not_to receive(:for)
      expect(UpdateFintualAccountInformation).not_to receive(:for)

      described_class.new.perform(account.id)
    end

    it "logs errors and does not raise" do
      account = create(:account, :buda, user: user)
      allow(UpdateBudaAccountInformation).to receive(:for).and_raise(StandardError.new("API down"))

      expect(Rails.logger).to receive(:error).with(/FetchAccountDataJob failed for account #{account.id}/)
      expect { described_class.new.perform(account.id) }.not_to raise_error
    end
  end
end
