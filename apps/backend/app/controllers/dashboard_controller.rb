class DashboardController < ApplicationController
  def show
    user = current_user

    # Balances grouped by currency
    balances = GetUserBalances.for(user: user)

    # User currencies (unique from accounts)
    user_currencies = user.accounts.select(:currency).distinct.map do |acc|
      {
        code: acc.currency,
        label: acc.currency, # Optionally map to a full label if you have a lookup
        symbol: (Money::Currency.new(acc.currency).symbol rescue acc.currency)
      }
    end

    # Accounts (with serializer for formatting)
    accounts = user.accounts.map { |acc| AccountSerializer.new(acc).serializable_hash[:data][:attributes] }

    # Recent transactions (latest 10, with serializer)
    recent_transactions = user.transactions.order(transaction_date: :desc).limit(10).map do |tx|
      TransactionSerializer.new(tx).serializable_hash[:data][:attributes]
    end

    # Spending insights grouped by currency and period
    spending_insights = {}
    user_currencies.each do |currency|
      code = currency[:code]
      spending_insights[code] = {}
      %w[this_month last_month].each do |period|
        time_range = period == 'this_month' ? Date.current.beginning_of_month..Date.current.end_of_month :
                                              1.month.ago.beginning_of_month..1.month.ago.end_of_month
        scope = user.transactions.joins(:account).where(accounts: { currency: code }, transaction_date: time_range)
        total_spent = scope.where('amount < 0').sum(:amount).abs
        total_earned = scope.where('amount > 0').sum(:amount)
        top_categories = scope.joins(:transaction_category)
                             .group('transaction_categories.name')
                             .sum(:amount)
                             .map { |cat, amt| { category: cat, amount: amt.abs } }
                             .sort_by { |c| -c[:amount] }
                             .first(5)
        spending_insights[code][period] = {
          total_spent: total_spent,
          total_earned: total_earned,
          top_categories: top_categories
        }
      end
    end

    render json: {
      balances: balances,
      user_currencies: user_currencies,
      accounts: accounts,
      recent_transactions: recent_transactions,
      spending_insights: spending_insights
    }, status: :ok
  end
end 