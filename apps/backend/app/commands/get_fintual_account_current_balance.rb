class GetFintualAccountCurrentBalance < PowerTypes::Command.new(:fintual_account)
  def perform
    balance = 0
    @client = FintualApiClient.new(@fintual_account.primary_key, @fintual_account.secret)
    @goals = @client.goals
    @goals.each { |g| balance += g.current }
    Money.new(balance)
  end
end
