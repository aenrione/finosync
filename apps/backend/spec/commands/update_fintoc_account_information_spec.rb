require "rails_helper"

RSpec.describe UpdateFintocAccountInformation, type: :command do
  let(:user) { create(:user) }
  let(:account) do
    create(
      :account, :fintoc, user: user,
      balance: 0, income: 0, expense: 0, primary_key: "link_test_abc"
    )
  end

  let(:client) { instance_double(Fintoc::Client) }

  before do
    ENV["FINTOC_SECRET_KEY"] ||= "sk_test_dummy"
    allow(Fintoc::Client).to receive(:new).and_return(client)
  end

  def stub_link(sub_accounts:)
    link = instance_double("Fintoc::Resources::Link", accounts: sub_accounts)
    allow(client).to receive(:get_link).with(account.primary_key).and_return(link)
    link
  end

  def stub_sub_account(id:, balance:, movements: [])
    instance_double(
      "Fintoc::Resources::Account",
      id: id,
      balance: instance_double("Fintoc::Resources::Balance", current: balance),
    ).tap do |dbl|
      allow(dbl).to receive(:get_movements).and_return(movements)
    end
  end

  describe "#perform" do
    context "when the upstream calls succeed" do
      it "sums balances from every Fintoc sub-account and saves the parent account" do
        stub_link(sub_accounts: [
          stub_sub_account(id: "acc_1", balance: 1500),
          stub_sub_account(id: "acc_2", balance: 2500),
        ])

        described_class.for(account: account)

        expect(account.reload.balance).to eq(4000)
      end

      it "no-ops when the account is not a fintoc account" do
        local = create(:account, user: user, balance: 999)

        expect(Fintoc::Client).not_to receive(:new)
        described_class.for(account: local)

        expect(local.reload.balance).to eq(999)
      end
    end

    context "when Fintoc returns HTML instead of JSON on get_link" do
      it "logs and returns without raising or modifying the account" do
        allow(client).to receive(:get_link).and_raise(
          JSON::ParserError.new("unexpected character: '<html><head>' at line 1 column 1")
        )
        expect(Rails.logger).to receive(:error).with(/get_link/).at_least(:once)

        expect {
          described_class.for(account: account)
        }.not_to raise_error

        expect(account.reload.balance).to eq(0)
      end
    end

    context "when one sub-account fails but the other succeeds" do
      it "skips the failing sub-account and still applies the successful one" do
        good = stub_sub_account(id: "acc_good", balance: 3000)
        bad = stub_sub_account(id: "acc_bad", balance: 999)
        allow(bad).to receive(:get_movements).and_raise(
          JSON::ParserError.new("unexpected character: '<html><head>' at line 1 column 1")
        )
        stub_link(sub_accounts: [good, bad])

        expect(Rails.logger).to receive(:error)
          .with(a_string_matching(/fintoc_sub_account.*acc_bad/))
          .at_least(:once)

        expect {
          described_class.for(account: account)
        }.not_to raise_error

        # Only the good sub-account's balance is reflected.
        expect(account.reload.balance).to eq(3000)
      end
    end

    context "when a sub-account raises a transient network error" do
      it "skips the sub-account instead of crashing the command" do
        bad = stub_sub_account(id: "acc_timeout", balance: 0)
        allow(bad).to receive(:get_movements).and_raise(Net::ReadTimeout)
        stub_link(sub_accounts: [bad])

        expect {
          described_class.for(account: account)
        }.not_to raise_error
      end
    end

    context "when a sub-account raises an unexpected error class" do
      it "propagates it (so we surface real bugs in tests/alerts)" do
        bad = stub_sub_account(id: "acc_boom", balance: 0)
        allow(bad).to receive(:get_movements).and_raise(ArgumentError, "something else")
        stub_link(sub_accounts: [bad])

        expect {
          described_class.for(account: account)
        }.to raise_error(ArgumentError)
      end
    end
  end
end
