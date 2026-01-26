def create_balance_changes_for_user(user)
  base_balance = 50000.0
  current_date = 6.months.ago.to_date
  6.times do |i|
    monthly_change = rand(-5000..8000)
    new_balance = base_balance + monthly_change
    user.update!(
      balance: new_balance,
      income: rand(3000..12000),
      expense: rand(1500..8000),
      investments_return: rand(-1000..3000)
    )
    base_balance = new_balance
  end
end

def create_balance_changes_for_account(account)
  base_balance = 10000.0
  current_date = 6.months.ago.to_date
  6.times do |i|
    monthly_change = rand(-2000..3000)
    new_balance = base_balance + monthly_change
    account.update!(
      balance: new_balance,
      income: rand(1000..5000),
      expense: rand(500..3000),
      investments_return: rand(-500..1000)
    )
    base_balance = new_balance
  end
end 