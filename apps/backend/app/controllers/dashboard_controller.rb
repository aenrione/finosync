class DashboardController < ApplicationController
  def show
    user = current_user
    currency = params[:currency].presence || "CLP"

    # Balances filtered by currency
    balances = GetUserBalances.for(user: user, currency: currency)

    # Accounts filtered by currency (with serializer for formatting)
    accounts = user.accounts.where(currency: currency).map do |acc|
      AccountSerializer.new(acc).serializable_hash[:data][:attributes]
    end

    # Recent transactions filtered by currency (latest 10, with serializer)
    recent_transactions = user.transactions
                              .joins(:account)
                              .where(accounts: { currency: currency })
                              .order(transaction_date: :desc)
                              .limit(10)
                              .map do |tx|
      TransactionSerializer.new(tx).serializable_hash[:data][:attributes]
    end

    # Spending insights for the single currency (flat hash)
    spending_insights = {}
    %w[this_month last_month].each do |period|
      time_range = period == 'this_month' ? Date.current.beginning_of_month..Date.current.end_of_month :
                                            1.month.ago.beginning_of_month..1.month.ago.end_of_month
      scope = user.transactions.joins(:account).where(accounts: { currency: currency }, transaction_date: time_range)
      total_spent = scope.where('amount < 0').sum(:amount).abs
      total_earned = scope.where('amount > 0').sum(:amount)
      top_categories = scope.joins(:transaction_category)
                           .group('transaction_categories.name')
                           .sum(:amount)
                           .map { |cat, amt| { category: cat, amount: amt.abs } }
                           .sort_by { |c| -c[:amount] }
                           .first(5)
      spending_insights[period] = {
        total_spent: total_spent,
        total_earned: total_earned,
        top_categories: top_categories
      }
    end

    render json: {
      balances: balances,
      accounts: accounts,
      recent_transactions: recent_transactions,
      spending_insights: spending_insights
    }, status: :ok
  end
end
