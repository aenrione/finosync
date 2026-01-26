class GetFintualAccountCurrentBalance < PowerTypes::Command.new(:fintual_account)
  def perform
    require 'fintual'
    balance = 0
    @client = Fintual::Client.new(@fintual_account.email, @fintual_account.secret)
    @goals = @client.goals
    @goals.each { |g| balance += g.current }
    Money.new(balance)
  end
end
