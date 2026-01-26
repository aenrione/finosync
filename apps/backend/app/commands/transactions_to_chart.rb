class TransactionsToChart < PowerTypes::Command.new(:user, month: nil, year: nil, type: nil)
  def perform
    return if @user.fintoc_account.blank?

    @month = if @month.present? || !@month.to_i.zero?
               @month.to_i
    else
               Time.now.month
    end
    @year = @year || Time.now.year
    @type = @type || "expense"

    @amount = 0
    results = {}
    results[:data] = get_transaction_data
    results[:total] = Money.new(@amount).format
    results
  end

  def get_transaction_data
    result = [ { name: "N.C",
                amount: calculate_amount_for_trans(no_category_trans) } ]
    @user.transaction_categories.each do |cat|
      trans = get_usefull_transactions(cat)
      next if trans.count.zero?

      amount = calculate_amount_for_trans(trans)
      next if amount.zero?

      result << { name: cat.name, amount: amount }
    end
    result
  end

  def calculate_amount_for_trans(trans)
    amount = 0
    trans.each do |t|
      next if t.ignore
      next if t.amount >= 0 && @type == "expense" || t.amount <= 0 && @type == "income"

      amount += t.amount
      @amount += t.amount
    end
    amount.to_i
  end

  def no_category_trans
    Transaction.where(fintoc_bank_account: @user.fintoc_account.fintoc_bank_accounts,
                      transaction_date: Date.new(@year, @month,
                                                 1)..Date.new(@year, @month, -1),
                      transaction_category: nil)
  end

  def get_usefull_transactions(category)
    category.transactions.where(
      transaction_date: Date.new(@year, @month, 1)..Date.new(@year, @month, -1)
    )
  end
end
