class ValidateFintocAccount < PowerTypes::Command.new(:fintoc_account)
  def perform
    require "fintoc"
    client = Fintoc::Client.new(ENV.fetch("FINTOC_SECRET_KEY"))
    link = client.get_link(@fintoc_account.primary_key)
  end
end
