class UpdateOneUserJob < ApplicationJob
  def perform(user_email)
    @user = User.find_by(email: user_email)
    update_user(@user)
  end

  def update_user(user)
    ActiveRecord::Base.transaction do
      # Update all accounts
      user.accounts.each do |account|
        case account.account_type
        when 'buda'
          UpdateBudaAccountInformation.for(buda_account: account)
        when 'fintoc'
          UpdateFintocAccountInformation.for(account: account)
        when 'fintual'
          UpdateFintualAccountInformation.for(fintual_account: account)
        end
      end
      
      update_user_balance(user)
      update_user_indicators(user)
      user.save!
    end
  end

  def update_user_balance(user)
    user.balance = user.accounts.sum(:balance)
  end

  def update_user_indicators(user)
    user.income = user.accounts.sum(:income)
    user.expense = user.accounts.sum(:expense)
    user.investments_return = user.accounts.sum(:investments_return)
  end
end

