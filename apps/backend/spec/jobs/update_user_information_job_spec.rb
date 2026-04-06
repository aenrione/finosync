require "rails_helper"

RSpec.describe UpdateUserInformationJob, type: :job do
  describe "#perform" do
    it "updates all users" do
      user1 = create(:user)
      user2 = create(:user)
      create(:account, user: user1, balance: 100)
      create(:account, user: user2, balance: 200)

      described_class.new.perform

      expect(user1.reload.balance).to eq(100)
      expect(user2.reload.balance).to eq(200)
    end
  end
end
