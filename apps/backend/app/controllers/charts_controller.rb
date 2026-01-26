class ChartsController < ApplicationController
  around_action :suppress_db_logging, only: [ :data ]

  def data
    @user = current_user
    currency, account_id, time_range, type = extract_params
    scope = build_scope(@user, account_id, time_range)
    render json: build_chart_data(scope, type, currency, time_range), status: :ok
  end

  private

  def suppress_db_logging
    old_logger = ActiveRecord::Base.logger
    ActiveRecord::Base.logger = nil
    yield
  ensure
    ActiveRecord::Base.logger = old_logger
  end

  def extract_params
    [
      params[:currency] || "CLP",
      params[:account_id],
      params[:time_range] || "6M",
      params[:type]
    ]
  end

  def build_scope(user, account_id, time_range)
    scope = user.transactions
    if account_id.present?
      account = user.accounts.find_by(id: account_id)
      return head(:not_found) unless account
      scope = scope.where(account: account)
    end
    apply_time_range(scope, time_range)
  end

  def build_chart_data(scope, type, currency, time_range)
    balance = get_balance_data(scope, time_range, currency)
    avg_income_value = (balance.sum { |d| d[:income].to_f } / (balance.size.nonzero? || 1))
    avg_expenses_value = (balance.sum { |d| d[:expenses].to_f } / (balance.size.nonzero? || 1))
    avg_savings_value = (balance.sum { |d| d[:net].to_f } / (balance.size.nonzero? || 1))
    
    # Format averages with Money
    avg_income = Money.from_amount(avg_income_value, currency).format
    avg_expenses = Money.from_amount(avg_expenses_value, currency).format
    avg_savings = Money.from_amount(avg_savings_value, currency).format
    
    # Keep balance data as numeric values for charts
    balance = balance.map do |d|
      d.transform_values do |v|
        v.is_a?(Numeric) ? v.round(2) : v
      end
    end
    {
      expenses: fetch_expenses(scope, type, currency),
      income: fetch_income(scope, type, currency),
      balance: balance,
      avgIncome: avg_income,
      avgExpenses: avg_expenses,
      avgSavings: avg_savings,
      account_balances: get_account_balance_data(@user.accounts, time_range),
      currency_overview: get_currency_overview(@user.transactions, time_range)
    }
  end

  def fetch_expenses(scope, type, currency)
    return [] if type == "income"
    get_category_data(scope.where("amount < 0"), currency)
  end

  def fetch_income(scope, type, currency)
    return [] if type == "expense"
    get_category_data(scope.where("amount > 0"), currency)
  end

  private

  def apply_time_range(scope, time_range)
    end_date = Date.current
    start_date = case time_range
    when "1M"
                   end_date - 1.month
    when "3M"
                   end_date - 3.months
    when "6M"
                   end_date - 6.months
    when "1Y"
                   end_date - 1.year
    else
                   end_date - 6.months
    end

    scope.where(transaction_date: start_date..end_date)
  end

  def get_category_data(scope, currency)
    scope.joins(:transaction_category)
         .joins(:account)
         .where(accounts: { currency: currency })
         .group("transaction_categories.name")
         .sum(:amount)
         .map do |category_name, total_amount|
           {
             category_name: category_name || "Uncategorized",
             amount: total_amount.abs
           }
         end
         .sort_by { |item| -item[:amount] }
         .first(10)
  end

  def get_balance_data(scope, time_range, currency)
    end_date = Date.current
    case time_range
    when "1M"
      # Breakdown by week for 1M
      weeks = 4
      balance_data = []
      weeks.times do |i|
        week_start = end_date - (weeks - i - 1).weeks
        week_end = week_start.end_of_week
        week_scope = scope.joins(:account)
                          .where(accounts: { currency: currency })
                          .where(transaction_date: week_start..week_end)
        income = week_scope.where("amount > 0").sum(:amount)
        expenses = week_scope.where("amount < 0").sum(:amount).abs
        net = income - expenses
        balance_data << {
          week: week_start.strftime("%b %d"),
          income: income,
          expenses: expenses,
          net: net
        }
      end
      balance_data
    when "3M", "6M", "1Y"
      months_back = case time_range
      when "3M" then 3
      when "6M" then 6
      when "1Y" then 12
      end
      balance_data = []
      months_back.times do |i|
        month_start = end_date - i.months
        month_end = month_start.end_of_month
        month_scope = scope.joins(:account)
                          .where(accounts: { currency: currency })
                          .where(transaction_date: month_start..month_end)
        income = month_scope.where("amount > 0").sum(:amount)
        expenses = month_scope.where("amount < 0").sum(:amount).abs
        net = income - expenses
        balance_data.unshift({
          month: month_start.strftime("%b"),
          income: income,
          expenses: expenses,
          net: net,
          currency: currency
        })
      end
      balance_data
    else
      []
    end
  end

  def get_account_balance_data(accounts, time_range)
    end_date = Date.current
    months_back = case time_range
    when "1M" then 1
    when "3M" then 3
    when "6M" then 6
    when "1Y" then 12
    else 6
    end

    accounts.map do |account|
      balance_data = []
      labels = []

      months_back.times do |i|
        month_start = end_date - i.months
        month_end = month_start.end_of_month

        balance = account.transactions
                        .where(transaction_date: month_start..month_end)
                        .sum(:amount)

        balance_data.unshift(balance)
        labels.unshift(month_start.strftime("%b"))
      end

      {
        id: account.id,
        name: account.account_name,
        currency: account.currency,
        balance: account.balance,
        data: balance_data,
        labels: labels,
        color: get_account_color(account.account_type)
      }
    end
  end

  def get_currency_overview(transactions, time_range)
    end_date = Date.current
    start_date = case time_range
    when "1M"
                   end_date - 1.month
    when "3M"
                   end_date - 3.months
    when "6M"
                   end_date - 6.months
    when "1Y"
                   end_date - 1.year
    else
                   end_date - 6.months
    end

    scope = transactions.joins(:account)
                       .where(transaction_date: start_date..end_date)

    scope.group("accounts.currency")
         .select("accounts.currency, SUM(CASE WHEN transactions.amount > 0 THEN transactions.amount ELSE 0 END) as income, SUM(CASE WHEN transactions.amount < 0 THEN ABS(transactions.amount) ELSE 0 END) as expenses")
         .map do |result|
           income_value = result.income || 0
           expenses_value = result.expenses || 0
           net_value = income_value - expenses_value
           
           {
             currency: result.currency,
             income: Money.from_amount(income_value, result.currency).format,
             expenses: Money.from_amount(expenses_value, result.currency).format,
             net: Money.from_amount(net_value, result.currency).format
           }
         end
  end

  def get_account_color(account_type)
    case account_type
    when "local"
      "#2563EB"
    when "fintual"
      "#059669"
    when "buda"
      "#7C3AED"
    when "fintoc"
      "#DC2626"
    else
      "#6B7280"
    end
  end
end
