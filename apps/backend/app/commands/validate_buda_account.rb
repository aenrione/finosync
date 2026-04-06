class ValidateBudaAccount < PowerTypes::Command.new(:buda_account)
  def perform
    @client = BudaApiClient.new(@buda_account.primary_key, @buda_account.secret)
    @balances = @client.balances
  end
end
