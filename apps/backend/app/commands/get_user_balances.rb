class GetUserBalances < PowerTypes::Command.new(:user)
  def perform
    accounts = @user.accounts

    accounts
      .group(:currency)
      .select(
        :currency,
        "SUM(balance) as balance",
        "SUM(income) as income",
        "SUM(expense) as expense",
        "SUM(investments_return) as investments_return"
      )
      .map do |record|
        @currency = record.currency
        {
          currency: record.currency,
          balance: parse_amount(record.balance),
          income: parse_amount(record.income),
          expense: parse_amount(record.expense),
          investments_return: parse_amount(record.investments_return)
        }
      end
  end

  private

  def parse_amount(amount)
    if amount.is_a?(Money)
      amount.format(currency: @currency)
    elsif amount.is_a?(Numeric)
      Money.new(amount * 100).format(currency: @currency)
    elsif amount.is_a?(String)
      Money.from_amount(amount.to_f, @currency).format
    else
      raise ArgumentError, "Invalid amount type: #{amount.class}"
    end
  end
end
