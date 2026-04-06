class UpdateFintualAccountInformation < PowerTypes::Command.new(:fintual_account)
  def perform
    balance = 0
    returns = 0
    @client = FintualApiClient.new(@fintual_account.primary_key, @fintual_account.secret)
    @goals = @client.goals
    @goals.each do |goal|
      ActiveRecord::Base.transaction do
        new_goal = FintualGoal.find_or_create_by!(goal_to_db(goal))
        balance += new_goal.current
        returns += new_goal.profit
      end
    end
    @fintual_account.balance = balance
    @fintual_account.investments_return = returns
    @fintual_account.save!
  end

  def goal_to_db(goal)
    {
      name: goal.name,
      creation_date: goal.created_at,
      current: goal.current,
      deposited: goal.deposited,
      profit: goal.profit,
      fintual_account: @fintual_account
    }
  end
end
