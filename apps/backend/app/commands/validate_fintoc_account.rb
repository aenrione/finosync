class ValidateFintocAccount < PowerTypes::Command.new(:fintoc_account)
  def perform
    require "fintoc"
    client = Fintoc::Client.new(@fintoc_account.secret)
    link = client.get_link(@fintoc_account.primary_key)
  end
end
