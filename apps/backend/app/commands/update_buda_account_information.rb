class UpdateBudaAccountInformation < PowerTypes::Command.new(:buda_account)
  require "cryptocompare"

  def perform
    @client = BudaApiClient.new(@buda_account.primary_key, @buda_account.secret)
    @balances = @client.balances
    @income = 0
    @expense = 0
    balance = 0

    @balances.each do |cur|
      ActiveRecord::Base.transaction do
        balance += currency_to_clp(cur)
        sync_asset(cur)
        sync_transactions_for(cur.id.downcase)
      end
    end

    @buda_account.balance = balance
    @buda_account.income = @income
    @buda_account.expense = @expense
    @buda_account.investments_return = get_investment_returns
    @buda_account.save!
  end

  private

  def sync_asset(cur)
    asset = AccountAsset.find_or_initialize_by(account: @buda_account, name: cur.id.upcase)
    asset.assign_attributes(
      currency: cur.id.upcase,
      current: cur.current.to_f,
      frozen_asset: cur.frozen.to_f,
      pending: cur.pending.to_f,
      deposited: 0,
      profit: 0
    )
    asset.save!
  end

  def sync_transactions_for(currency)
    @client.deposits(currency).each do |dep|
      next if Transaction.exists?(transaction_id: "buda-dep-#{dep.id}")

      t = Transaction.create!(
        account: @buda_account,
        transaction_id: "buda-dep-#{dep.id}",
        amount: dep.amount.to_f,
        currency: dep.currency&.upcase || currency.upcase,
        description: "Buda deposit (#{currency.upcase})",
        transaction_type: "deposit",
        transaction_date: Time.zone.parse(dep.created_at).to_date,
        post_date: Time.zone.parse(dep.created_at).to_date
      )
      Rules::ApplyFirstMatchingRule.new(transaction: t).call
    end

    @client.withdrawals(currency).each do |wd|
      next if Transaction.exists?(transaction_id: "buda-wd-#{wd.id}")

      t = Transaction.create!(
        account: @buda_account,
        transaction_id: "buda-wd-#{wd.id}",
        amount: -wd.amount.to_f.abs,
        currency: wd.currency&.upcase || currency.upcase,
        description: "Buda withdrawal (#{currency.upcase})",
        transaction_type: "withdrawal",
        transaction_date: Time.zone.parse(wd.created_at).to_date,
        post_date: Time.zone.parse(wd.created_at).to_date
      )
      Rules::ApplyFirstMatchingRule.new(transaction: t).call
    end

    update_monthly_indicators
  end

  def update_monthly_indicators
    @buda_account.transactions.where(
      "transaction_date >= ?", Time.zone.today.at_beginning_of_month
    ).each do |t|
      next if t.ignore

      if t.amount >= 0
        @income += t.amount
      else
        @expense += t.amount
      end
    end
  end

  def get_investment_returns
    deposited = 0
    returned = 0
    @client.deposits("clp").each { |d| deposited += d.amount.to_f }
    @client.withdrawals("clp").each { |w| returned += w.amount.to_f }
    @buda_account.balance - deposited + returned
  end

  def currency_to_clp(cur)
    return 0 if cur.id == "CLP"

    begin
      ticker_amount = Cryptocompare::Price.find(cur.id, "CLP")[cur.id]["CLP"]
    rescue
      ticker_amount = @client.get_market("#{cur.id}-clp").last_price
    end
    cur.available.to_f * ticker_amount.to_f
  end
end
