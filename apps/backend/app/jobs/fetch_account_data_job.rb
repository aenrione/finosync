class FetchAccountDataJob < ApplicationJob
  queue_as :default

  def perform(account_id)
    account = Account.find(account_id)

    case account.account_type
    when "buda"
      UpdateBudaAccountInformation.for(buda_account: account)
    when "fintoc"
      UpdateFintocAccountInformation.for(account: account)
    when "fintual"
      Rails.logger.info("FetchAccountDataJob: Fintual integration is temporarily disabled (API auth change)")
    end
  rescue => e
    Rails.logger.error("FetchAccountDataJob failed for account #{account_id}: #{e.message}")
  end
end
