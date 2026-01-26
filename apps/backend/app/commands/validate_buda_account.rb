class ValidateBudaAccount < PowerTypes::Command.new(:buda_account)
  require "buda"
  def perform
    @client = Buda::Client.new(@buda_account.primary_key, @buda_account.secret)
    @balances = @client.balances
  end
end
