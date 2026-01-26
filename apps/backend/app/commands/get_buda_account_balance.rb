class GetBudaAccountBalance < PowerTypes::Command.new(:buda_account)
  def perform
    require "buda"
    @client = Buda::Client.new(@buda_account.api_key, @buda_account.secret)
    @balances = @client.balances
    Money.new(balances_to_clp)
  end

  def balances_to_clp
    real_balance = 0
    @balances.each do |b|
      unless b.id == "CLP"
        ticker_amount = @client.get_market("#{b.id}-clp").ticker.last_price
        real_balance += b.available.to_f * ticker_amount.to_f
      end
    end
    real_balance
  end
end
