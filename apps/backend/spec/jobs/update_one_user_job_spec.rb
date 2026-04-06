require "rails_helper"

RSpec.describe UpdateOneUserJob, type: :job do
  let(:user) { create(:user) }

  describe "#perform" do
    it "updates buda account information" do
      account = create(:account, :buda, user: user)
      expect(UpdateBudaAccountInformation).to receive(:for).with(buda_account: account)

      described_class.new.perform(user.email_address)
    end

    it "updates fintoc account information" do
      account = create(:account, :fintoc, user: user)
      expect(UpdateFintocAccountInformation).to receive(:for).with(account: account)

      described_class.new.perform(user.email_address)
    end

    it "updates fintual account information" do
      account = create(:account, :fintual, user: user)
      expect(UpdateFintualAccountInformation).to receive(:for).with(fintual_account: account)

      described_class.new.perform(user.email_address)
    end

    it "skips local accounts" do
      create(:account, user: user)
      expect(UpdateBudaAccountInformation).not_to receive(:for)
      expect(UpdateFintocAccountInformation).not_to receive(:for)
      expect(UpdateFintualAccountInformation).not_to receive(:for)

      described_class.new.perform(user.email_address)
    end

    it "updates user balance from account totals" do
      create(:account, user: user, balance: 100)
      create(:account, user: user, balance: 200)

      described_class.new.perform(user.email_address)
      user.reload

      expect(user.balance).to eq(300)
    end

    it "updates user income, expense, and investments_return" do
      create(:account, user: user, income: 500, expense: 200, investments_return: 50)

      described_class.new.perform(user.email_address)
      user.reload

      expect(user.income).to eq(500)
      expect(user.expense).to eq(200)
      expect(user.investments_return).to eq(50)
    end
  end
end
