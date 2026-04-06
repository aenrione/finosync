class UpdateBudaAccountInformation < PowerTypes::Command.new(:buda_account)
  require "cryptocompare"

  def perform
    @client = BudaApiClient.new(@buda_account.primary_key, @buda_account.secret)
    @balances = @client.balances
    balance = 0
    @balances.each do |cur|
      ActiveRecord::Base.transaction do
        balance += currency_to_clp(cur)
        BudaCurrency.find_or_create_by!(currency_to_db(cur))
      end
    end
    @buda_account.balance = balance
    @buda_account.investments_return = get_investment_returns
    @buda_account.save!
  end

  def get_investment_returns
    deposited = 0
    returned = 0
    deposits = @client.deposits("clp")
    deposits.each do |deposit|
      deposited += deposit.amount.to_i
    end
    withdrawals = @client.withdrawals("clp")
    withdrawals.each do |w|
      returned += w.amount.to_i
    end
    @buda_account.balance - deposited + returned
  end

  def currency_to_clp(cur)
    return 0 if cur.id == "CLP"

    real_balance = 0
    begin
      ticker_amount = Cryptocompare::Price.find(cur.id, "CLP")[cur.id]["CLP"]
    rescue
      ticker_amount = @client.get_market("#{cur.id}-clp").last_price
    end
    real_balance += cur.available.to_f * ticker_amount.to_f
    real_balance
  end

  def currency_to_db(cur)
    {
      currency: cur.id.upcase,
      available: cur.available,
      current: cur.current,
      frozen_amount: cur.frozen,
      pending: cur.pending,
      buda_account_id: @buda_account.id
    }
  end
end
