class UserBalanceToChart < PowerTypes::Command.new(:user)
  def perform
    results = {}
    results[:user] = get_obj_balances(@user)
    
    @user.accounts.each do |account|
      results[account.account_type.to_sym] = get_obj_balances(account)
    end
    
    results
  end

  def get_obj_balances(parent_obj)
    result = { labels: [], data: [], dates: [], formated_data: [], formatted_dates: [] }
    versions = parent_obj.versions
    versions.each do |version|
      obj = version.reify
      result[:dates] << version.created_at.to_date.to_s
      result[:data] << obj.balance.to_i
      result[:formated_data] << obj.balance_amount.format
      result[:formatted_dates] << version.created_at.strftime("%d %b")
    end
    result
  end
end
