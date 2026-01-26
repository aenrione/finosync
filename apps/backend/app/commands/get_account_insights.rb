class GetAccountInsights < PowerTypes::Command.new(:account)
  def perform
    transactions = @account.transactions
    return empty_insights if transactions.empty?

    total_income = calculate_total_income(transactions)
    total_expenses = calculate_total_expenses(transactions)
    transaction_count = transactions.count
    average_transaction = calculate_average_transaction(transactions)
    top_category = calculate_top_category(transactions)

    {
      total_income: total_income.format,
      total_expenses: total_expenses.format,
      transaction_count: transaction_count,
      average_transaction: average_transaction.format,
      top_category_name: top_category[:name],
      top_category_amount: top_category[:amount].format
    }
  end

  private

  def empty_insights
    zero_money = Money.new(0, @account.currency)
    {
      total_income: zero_money.format,
      total_expenses: zero_money.format,
      transaction_count: 0,
      average_transaction: zero_money.format,
      top_category_name: "None",
      top_category_amount: zero_money.format
    }
  end

  def calculate_total_income(transactions)
    income_transactions = transactions.where("amount > 0")
    total_amount_decimal = income_transactions.sum(:amount)
    Money.from_amount(total_amount_decimal, @account.currency)
  end

  def calculate_total_expenses(transactions)
    expense_transactions = transactions.where("amount < 0")
    total_amount_decimal = expense_transactions.sum(:amount).abs
    Money.from_amount(total_amount_decimal, @account.currency)
  end

  def calculate_average_transaction(transactions)
    return Money.new(0, @account.currency) if transactions.empty?

    total_amount_decimal = transactions.sum(:amount).abs
    average_decimal = total_amount_decimal / transactions.count
    Money.from_amount(average_decimal, @account.currency)
  end

  def calculate_top_category(transactions)
    category_totals = transactions.joins(:transaction_category)
                                 .group("transaction_categories.name")
                                 .sum(:amount)

    if category_totals.empty?
      return {
        name: "Other",
        amount: Money.new(0, @account.currency)
      }
    end

    top_category_name, top_amount_decimal = category_totals
                                           .transform_values(&:abs)
                                           .max_by { |_, amount| amount }

    {
      name: top_category_name,
      amount: Money.from_amount(top_amount_decimal, @account.currency)
    }
  end
end
