class UpdateFintualAccountInformation < PowerTypes::Command.new(:fintual_account)
  def perform
    unless @fintual_account.session_token.present?
      raise FintualApiClient::Error, "No session cookie — please re-authenticate your Fintual account"
    end

    balance = 0
    returns = 0
    total_deposited = 0
    total_withdrawn = 0
    @client = FintualApiClient.new(@fintual_account.session_token)
    @goals = @client.goals

    ActiveRecord::Base.transaction do
      @goals.each do |goal|
        asset = AccountAsset.find_or_initialize_by(
          account: @fintual_account,
          name: goal.name
        )
        asset.assign_attributes(
          currency: "CLP",
          current: goal.current,
          deposited: goal.deposited,
          profit: goal.profit,
          pending: goal.not_net_deposited,
          frozen_asset: goal.withdrawn,
          creation_date: Time.zone.parse(goal.created_at).to_date
        )
        asset.save!

        balance += goal.current
        returns += goal.profit
        total_deposited += goal.not_net_deposited
        total_withdrawn += goal.withdrawn
      end

      @fintual_account.balance = balance
      @fintual_account.investments_return = returns
      @fintual_account.income = total_deposited
      @fintual_account.expense = -total_withdrawn
      @fintual_account.save!
    end
  end
end
