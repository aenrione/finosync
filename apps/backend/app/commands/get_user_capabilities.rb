class GetUserCapabilities < PowerTypes::Command.new(:user)
  def perform
    result = {
      accounts: @user.accounts.map do |account|
        {
          id: account.id,
          type: account.account_type,
          name: account.account_name,
          currency: account.currency,
          balance: account.balance,
          hasAccount: true
        }
      end
    }
    
    # Add specific account types for backward compatibility
    fintoc_account = @user.accounts.find_by(account_type: :fintoc)
    buda_account = @user.accounts.find_by(account_type: :buda)
    fintual_account = @user.accounts.find_by(account_type: :fintual)
    
    result[:hasFintocAccount] = fintoc_account.present?
    result[:hasBudaAccount] = buda_account.present?
    result[:hasFintualAccount] = fintual_account.present?
    
    if fintoc_account.present?
      result[:fintoc] = AccountSerializer.new(fintoc_account).serializable_hash
    end
    if buda_account.present?
      result[:buda] = AccountSerializer.new(buda_account).serializable_hash
    end
    if fintual_account.present?
      result[:fintual] = AccountSerializer.new(fintual_account).serializable_hash
    end
    
    result
  end
end
