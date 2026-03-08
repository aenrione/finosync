class GetFintocAccountBalance < PowerTypes::Command.new(:fintoc_account)
  def perform
    require "fintoc"
    client = Fintoc::Client.new(ENV.fetch("FINTOC_SECRET_KEY"))
    link = client.get_link(@fintoc_account.link)
    # accounts = link.find_all(currency: 'CLP')
    balance = 0
    link.accounts.each { |acc| balance += acc.balance.current }
    Money.new(balance)
  end
end
