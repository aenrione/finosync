class UpdateFintocAccountInformation < PowerTypes::Command.new(:account)
  require "fintoc"

  def perform
    return unless @account.fintoc?

    @balance = 0
    @income = 0
    @expense = 0
    @client = Fintoc::Client.new(ENV.fetch("FINTOC_SECRET_KEY"))
    @link = @client.get_link(@account.primary_key)

    @link.accounts.each do |fintoc_acc|
      ActiveRecord::Base.transaction do
        sync_transactions_from_fintoc_account(fintoc_acc)
        update_balance_from_fintoc_account(fintoc_acc)
      end
    end

    @account.balance = @balance
    @account.income = @income
    @account.expense = @expense
    @account.save!
  end

  def update_balance_from_fintoc_account(fintoc_acc)
    @balance += fintoc_acc.balance.current
  end

  def sync_transactions_from_fintoc_account(fintoc_acc)
    fintoc_acc.get_movements.each do |mov|
      trans = Transaction.find_by(transaction_id: mov.id)
      next if trans.present?

      transaction = Transaction.create!(transaction_to_db(mov))
      Rules::ApplyFirstMatchingRule.new(transaction: transaction).call
    end

    # Update monthly indicators
    income, expense = get_monthly_indicators_for_account
    @income += income
    @expense += expense
  end


  def transaction_to_db(trans)
    {
      amount: trans.amount,
      comment: trans.comment,
      description: trans.description,
      transaction_type: trans.type,
      currency: trans.currency,
      transaction_id: trans.id,
      post_date: trans.post_date,
      transaction_date: trans.transaction_date || trans.post_date,
      account_id: @account.id
    }.merge(get_holder_account(trans))
  end

  def get_holder_account(trans)
    if trans.recipient_account.present?
      recipient = trans.recipient_account
      holder_id = recipient.holder_id
      holder_name = recipient.holder_name
      holder_institution = recipient.institution.name
    elsif trans.sender_account.present?
      sender = trans.sender_account
      holder_id = sender.holder_id
      holder_name = sender.holder_name
      holder_institution = sender.institution.name
    end

    {
      holder_id: holder_id, holder_name: holder_name,
      holder_institution: holder_institution
    }
  end

  def get_monthly_indicators_for_account
    income = 0
    expense = 0
    transactions = @account.transactions.where(
      "transaction_date >= ?", Time.zone.today.at_beginning_of_month
    )
    transactions.each do |t|
      next if t.ignore
      if t.amount >= 0
        income += t.amount
      else
        expense += t.amount
      end
    end
    [ income, expense ]
  end
end
