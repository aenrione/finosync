require_relative './seeds_helper'

puts "=== SEEDS STARTING ==="

user = User.find_or_create_by(email_address: "user@test.com") do |u|
  u.name = "Test User"
  u.password = "password"
end if Rails.env.development?

if Rails.env.development? || Rails.env.test?
  include FactoryBot::Syntax::Methods

  puts "Starting seed process..."
  puts "User exists: #{user.present?}"
  puts "User versions before: #{user.versions.count}"

  # Create realistic categories
  categories = create_realistic_categories(user)
  puts "Created #{categories.size} transaction categories"

  # Create accounts for the User if they don't exist
  if user.accounts.empty?
    puts "Creating accounts..."

    # CLP checking account (main)
    clp_account = FactoryBot.create(:account,
      user: user,
      account_name: "Banco Estado Checking",
      account_type: :local,
      currency: "CLP",
      balance: 1_250_000
    )

    # USD savings
    usd_account = FactoryBot.create(:account,
      user: user,
      account_name: "USD Savings",
      account_type: :local,
      currency: "USD",
      balance: 3_450.00
    )

    # Fintoc-synced bank
    fintoc_account = FactoryBot.create(:account, :fintoc,
      user: user,
      account_name: "Banco Chile Visa",
      currency: "CLP",
      balance: 850_000
    )

    # Fintual investment
    fintual_account = FactoryBot.create(:account, :fintual,
      user: user,
      account_name: "Fintual Risky Norris",
      currency: "CLP",
      balance: 2_100_000
    )

    # Buda crypto
    buda_account = FactoryBot.create(:account, :buda,
      user: user,
      account_name: "Buda BTC",
      currency: "USD",
      balance: 1_200.00
    )

    accounts = [ clp_account, usd_account, fintoc_account, fintual_account, buda_account ]

    # Create realistic transactions for each account
    accounts.each do |account|
      expenses_per_month = account.currency == "CLP" ? 18 : 8
      incomes_per_month = account.currency == "CLP" ? 3 : 1
      create_realistic_transactions(account, categories,
        months_back: 6,
        per_month_expenses: expenses_per_month,
        per_month_incomes: incomes_per_month
      )
      puts "Created transactions for #{account.account_name} (#{account.currency})"
    end

    # Create balance changes for charts (paper trail versions)
    accounts.each do |account|
      puts "Creating balance changes for account: #{account.account_name}"
      create_balance_changes_for_account(account)
      puts "Account #{account.account_name} versions: #{account.versions.count}"
    end
  else
    puts "Accounts already exist: #{user.accounts.count}"
  end

  repair_seed_account_snapshots(user)
  puts "Repaired seeded account balances and versions"
  puts "User versions after: #{user.versions.count}"

  if user.shopping_lists.empty?
    FactoryBot.create_list(:shopping_list, 2, :with_items, user: user)
    puts "Created 2 shopping lists"
  end

  # Create default category groups and assign categories
  if user.category_groups.empty?
    create_default_category_groups(user, categories)
    puts "Created #{user.category_groups.count} category groups"
  end

  # Create sample budget period with allocations
  if user.budget_periods.empty?
    period = create_sample_budget_period(user, categories)
    puts "Created budget period #{period.year}-#{period.month} with #{period.budget_allocations.count} allocations"
  end

  puts "Seed process completed!"
end

puts "=== SEEDS FINISHED ==="
