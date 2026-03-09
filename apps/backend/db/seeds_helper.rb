BALANCE_HISTORY_FACTORS = [ 0.62, 0.74, 0.81, 0.89, 0.95, 1.0 ].freeze

SEED_ACCOUNT_SNAPSHOTS = {
  "Banco Estado Checking" => {
    balance: 1_250_000,
    income: 2_400_000,
    expense: 1_150_000,
    investments_return: 0
  },
  "USD Savings" => {
    balance: 3_450,
    income: 850,
    expense: 220,
    investments_return: 0
  },
  "Banco Chile Visa" => {
    balance: 850_000,
    income: 1_950_000,
    expense: 1_100_000,
    investments_return: 0
  },
  "Fintual Risky Norris" => {
    balance: 2_100_000,
    income: 180_000,
    expense: 90_000,
    investments_return: 135_000
  },
  "Buda BTC" => {
    balance: 1_200,
    income: 320,
    expense: 110,
    investments_return: 85
  }
}.freeze

def create_balance_changes_for_user(user)
  final_balance = user.accounts.sum(:balance).to_f
  final_income = user.accounts.sum(:income).to_f
  final_expense = user.accounts.sum(:expense).to_f
  final_investments_return = user.accounts.sum(:investments_return).to_f

  rebuild_version_history!(
    user,
    balance: final_balance,
    income: final_income,
    expense: final_expense,
    investments_return: final_investments_return,
  )
end

def create_balance_changes_for_account(account)
  snapshot = SEED_ACCOUNT_SNAPSHOTS[account.account_name] || {
    balance: account.balance.to_f,
    income: account.income.to_f,
    expense: account.expense.to_f,
    investments_return: account.investments_return.to_f
  }

  rebuild_version_history!(account, **snapshot)
end

def repair_seed_account_snapshots(user)
  user.accounts.each do |account|
    snapshot = SEED_ACCOUNT_SNAPSHOTS[account.account_name]
    next unless snapshot

    account.update!(snapshot)
    create_balance_changes_for_account(account)
  end

  create_balance_changes_for_user(user)
end

def rebuild_version_history!(record, balance:, income:, expense:, investments_return:)
  PaperTrail::Version.where(item_type: record.class.name, item_id: record.id).delete_all

  BALANCE_HISTORY_FACTORS.each_with_index do |factor, index|
    timestamp = (BALANCE_HISTORY_FACTORS.length - index - 1).months.ago.end_of_month.change(hour: 12)

    record.update!(
      balance: scaled_value(balance, factor),
      income: scaled_value(income, [ factor, 0.45 ].max),
      expense: scaled_value(expense, [ factor - 0.08, 0.35 ].max),
      investments_return: scaled_value(investments_return, [ factor - 0.04, 0.25 ].max),
    )

    record.versions.last&.update_columns(created_at: timestamp)
  end

  record.update!(
    balance: balance,
    income: income,
    expense: expense,
    investments_return: investments_return,
  )
end

def scaled_value(value, factor)
  (value.to_f * factor).round(2)
end

CATEGORY_DEFINITIONS = {
  "Food & Dining" => { icon: "Utensils", description: "Restaurants, groceries, delivery" },
  "Transportation" => { icon: "Car", description: "Gas, rideshare, public transit" },
  "Shopping" => { icon: "ShoppingBag", description: "Clothing, electronics, general purchases" },
  "Entertainment" => { icon: "Gamepad2", description: "Streaming, events, hobbies" },
  "Healthcare" => { icon: "Heart", description: "Doctor visits, pharmacy, insurance" },
  "Utilities" => { icon: "Zap", description: "Electricity, water, internet, phone" },
  "Salary" => { icon: "DollarSign", description: "Monthly salary and wages" },
  "Freelance" => { icon: "Briefcase", description: "Freelance and contract income" },
  "Education" => { icon: "BookOpen", description: "Courses, books, tuition" },
  "Travel" => { icon: "Plane", description: "Flights, hotels, travel expenses" }
}.freeze

EXPENSE_CATEGORIES = [ "Food & Dining", "Transportation", "Shopping", "Entertainment", "Healthcare", "Utilities", "Education", "Travel" ].freeze
INCOME_CATEGORIES = [ "Salary", "Freelance" ].freeze

EXPENSE_DESCRIPTIONS = {
  "Food & Dining" => [ "Uber Eats", "Starbucks", "Supermercado Lider", "Rappi order", "Restaurant dinner", "Bakery", "Sushi delivery" ],
  "Transportation" => [ "Uber ride", "Metro card refill", "Copec gas", "Shell gas", "Parking garage", "Bus fare" ],
  "Shopping" => [ "Amazon purchase", "Falabella", "Nike store", "Zara", "MercadoLibre", "AliExpress" ],
  "Entertainment" => [ "Netflix", "Spotify", "Steam game", "Movie tickets", "Concert ticket", "Disney+" ],
  "Healthcare" => [ "Farmacia Ahumada", "Doctor visit", "Dental checkup", "Lab tests", "Pharmacy" ],
  "Utilities" => [ "Electricity bill", "Water bill", "Internet Movistar", "Phone plan", "Gas bill" ],
  "Education" => [ "Udemy course", "Book purchase", "Coursera subscription", "Language class" ],
  "Travel" => [ "Airbnb", "LATAM flight", "Hotel booking", "Travel insurance" ]
}.freeze

INCOME_DESCRIPTIONS = {
  "Salary" => [ "Monthly salary", "Salary deposit", "Bonus payment", "13th month salary" ],
  "Freelance" => [ "Freelance project", "Consulting fee", "Contract payment", "Side project income" ]
}.freeze

def create_realistic_categories(user)
  categories = {}
  CATEGORY_DEFINITIONS.each do |name, attrs|
    cat = user.transaction_categories.find_or_create_by!(name: name) do |c|
      c.icon = attrs[:icon]
      c.description = attrs[:description]
    end
    categories[name] = cat
  end
  categories
end

DEFAULT_CATEGORY_GROUPS = [
  { name: "Income", group_type: :income, display_order: 0, categories: INCOME_CATEGORIES },
  { name: "Fixed Expenses", group_type: :expense, display_order: 1, categories: [ "Utilities" ] },
  { name: "Variable Expenses", group_type: :expense, display_order: 2, categories: [ "Food & Dining", "Transportation", "Shopping", "Entertainment", "Travel" ] },
  { name: "Health & Education", group_type: :expense, display_order: 3, categories: [ "Healthcare", "Education" ] },
  { name: "Savings", group_type: :savings, display_order: 4, categories: [] }
].freeze

def create_default_category_groups(user, categories = {})
  DEFAULT_CATEGORY_GROUPS.each do |group_def|
    group = user.category_groups.find_or_create_by!(name: group_def[:name]) do |g|
      g.group_type = group_def[:group_type]
      g.display_order = group_def[:display_order]
    end

    # Assign categories to this group
    group_def[:categories].each do |cat_name|
      cat = categories[cat_name] || user.transaction_categories.find_by(name: cat_name)
      next unless cat

      cat.update!(category_group: group, is_income: group_def[:group_type] == :income)
    end
  end
end

def create_sample_budget_period(user, categories)
  today = Date.current
  period = user.budget_periods.find_or_create_by!(year: today.year, month: today.month)

  # Sample allocations for expense categories
  sample_allocations = {
    "Food & Dining" => 200_000,
    "Transportation" => 80_000,
    "Shopping" => 100_000,
    "Entertainment" => 50_000,
    "Healthcare" => 40_000,
    "Utilities" => 60_000,
    "Education" => 30_000,
    "Travel" => 150_000
  }

  sample_allocations.each do |cat_name, amount|
    cat = categories[cat_name]
    next unless cat

    period.budget_allocations.find_or_create_by!(transaction_category_id: cat.id) do |a|
      a.planned_amount = amount
    end
  end

  period
end

def create_realistic_transactions(account, categories, months_back: 6, per_month_expenses: 15, per_month_incomes: 2)
  months_back.times do |i|
    month_date = Date.current - i.months
    month_start = month_date.beginning_of_month
    month_end = [ month_date.end_of_month, Date.current ].min

    # Create expenses spread across the month
    per_month_expenses.times do
      cat_name = EXPENSE_CATEGORIES.sample
      category = categories[cat_name]
      descriptions = EXPENSE_DESCRIPTIONS[cat_name] || [ "Purchase" ]
      tx_date = Faker::Date.between(from: month_start, to: month_end)

      # Vary amounts by category — scale for currency (CLP ~900x USD)
      multiplier = account.currency == "CLP" ? 1 : 0.001
      amount = case cat_name
      when "Food & Dining" then -rand(3_000..45_000) * multiplier
      when "Transportation" then -rand(1_500..25_000) * multiplier
      when "Shopping" then -rand(10_000..120_000) * multiplier
      when "Entertainment" then -rand(5_000..30_000) * multiplier
      when "Healthcare" then -rand(15_000..80_000) * multiplier
      when "Utilities" then -rand(10_000..50_000) * multiplier
      when "Education" then -rand(15_000..100_000) * multiplier
      when "Travel" then -rand(30_000..300_000) * multiplier
      else -rand(5_000..50_000) * multiplier
      end.round(2)

      FactoryBot.create(:transaction,
        account: account,
        transaction_category: category,
        amount: amount,
        currency: account.currency,
        description: descriptions.sample,
        transaction_date: tx_date,
        post_date: tx_date,
        transaction_type: "purchase"
      )
    end

    # Create income entries
    per_month_incomes.times do
      cat_name = INCOME_CATEGORIES.sample
      category = categories[cat_name]
      descriptions = INCOME_DESCRIPTIONS[cat_name] || [ "Income" ]
      tx_date = Faker::Date.between(from: month_start, to: month_end)

      multiplier = account.currency == "CLP" ? 1 : 0.001
      amount = case cat_name
      when "Salary" then (rand(800_000..2_500_000) * multiplier).round(2)
      when "Freelance" then (rand(200_000..800_000) * multiplier).round(2)
      else (rand(100_000..500_000) * multiplier).round(2)
      end

      FactoryBot.create(:transaction,
        account: account,
        transaction_category: category,
        amount: amount,
        currency: account.currency,
        description: descriptions.sample,
        transaction_date: tx_date,
        post_date: tx_date,
        transaction_type: "deposit"
      )
    end
  end
end
