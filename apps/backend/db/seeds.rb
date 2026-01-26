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

  # Create balance changes for user if they don't exist
  if user.versions.empty?
    puts "Creating balance changes for user"
    create_balance_changes_for_user(user)
    puts "User versions after: #{user.versions.count}"
  end

  # Create accounts for the User if they don't exist
  if user.accounts.empty?
    puts "Creating accounts..."
    account_types = [ :local, :fintoc, :fintual, :buda ]
    accounts = []
    
    account_types.each do |account_type|
      account = FactoryBot.create(:account, account_type, :with_transactions,
                                 user: user, account_type: account_type)
      accounts << account
      puts "Created account: #{account.account_name} (#{account.account_type})"
    end

    # Create balance changes for charts (paper trail versions)
    accounts.each do |account|
      puts "Creating balance changes for account: #{account.account_name}"
      create_balance_changes_for_account(account)
      puts "Account #{account.account_name} versions: #{account.versions.count}"
    end
  else
    puts "Accounts already exist: #{user.accounts.count}"
    # Create balance changes for existing accounts if they don't have versions
    user.accounts.each do |account|
      if account.versions.empty?
        puts "Creating balance changes for existing account: #{account.account_name}"
        create_balance_changes_for_account(account)
        puts "Account #{account.account_name} versions: #{account.versions.count}"
      else
        puts "Account #{account.account_name} already has #{account.versions.count} versions"
      end
    end
  end

  # Create other data if it doesn't exist
  if user.transaction_categories.empty?
    FactoryBot.create_list(:transaction_category, 5, user: user)
    puts "Created 5 transaction categories"
  end
  
  if user.budget_lists.empty?
    FactoryBot.create_list(:budget_list, 2, :with_items, user: user)
    puts "Created 2 budget lists"
  end

  
  puts "Seed process completed!"
end

puts "=== SEEDS FINISHED ==="
