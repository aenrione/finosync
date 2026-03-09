require "rails_helper"

RSpec.describe RecurringTransaction, type: :model do
  describe "validations" do
    it "requires a name" do
      rt = build(:recurring_transaction, name: nil)
      expect(rt).not_to be_valid
    end

    it "requires amount > 0" do
      rt = build(:recurring_transaction, amount: 0)
      expect(rt).not_to be_valid
    end

    it "requires start_date" do
      rt = build(:recurring_transaction, start_date: nil)
      expect(rt).not_to be_valid
    end

    it "requires next_due_date" do
      rt = build(:recurring_transaction, next_due_date: nil)
      expect(rt).not_to be_valid
    end

    it "requires account when auto_create is true" do
      rt = build(:recurring_transaction, auto_create: true, account: nil)
      expect(rt).not_to be_valid
    end

    it "allows no account when auto_create is false" do
      rt = build(:recurring_transaction, auto_create: false, account: nil)
      expect(rt).to be_valid
    end
  end

  describe "enums" do
    it "has correct frequency values" do
      expect(RecurringTransaction.frequencies.keys).to include("weekly", "monthly", "annually")
    end

    it "has correct transaction_type values" do
      expect(RecurringTransaction.transaction_types.keys).to eq(["expense", "income"])
    end
  end

  describe "scopes" do
    it ".active returns only active records" do
      active = create(:recurring_transaction, is_active: true)
      create(:recurring_transaction, :inactive)

      expect(RecurringTransaction.active).to eq([active])
    end

    it ".upcoming returns entries within days window" do
      upcoming = create(:recurring_transaction, next_due_date: 5.days.from_now)
      create(:recurring_transaction, next_due_date: 60.days.from_now)

      expect(RecurringTransaction.upcoming(30)).to eq([upcoming])
    end
  end

  describe "#advance_next_due_date!" do
    it "advances monthly by 1 month" do
      rt = create(:recurring_transaction, frequency: :monthly, next_due_date: Date.new(2026, 1, 15))
      rt.advance_next_due_date!
      expect(rt.reload.next_due_date).to eq(Date.new(2026, 2, 15))
    end

    it "advances weekly by 7 days" do
      rt = create(:recurring_transaction, frequency: :weekly, next_due_date: Date.new(2026, 1, 1))
      rt.advance_next_due_date!
      expect(rt.reload.next_due_date).to eq(Date.new(2026, 1, 8))
    end

    it "deactivates if next date exceeds end_date" do
      rt = create(:recurring_transaction,
                  frequency: :monthly,
                  next_due_date: Date.new(2026, 12, 1),
                  end_date: Date.new(2026, 12, 15))
      rt.advance_next_due_date!
      expect(rt.reload.is_active).to be false
    end
  end
end
