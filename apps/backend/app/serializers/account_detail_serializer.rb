class AccountDetailSerializer
  include JSONAPI::Serializer
  
  attributes :id, :account_name, :currency, :account_type, :created_at, :updated_at

  attribute :balance do |object|
    object.balance_amount.format
  end

  attribute :income do |object|
    object.income_amount.format
  end
  
  attribute :expense do |object|
    object.expense_amount.format
  end

  attribute :investments_return do |object|
    object.return_amount.format
  end

  attribute :editable do |object|
    object.editable?
  end

  # Include insights if provided in options
  attribute :insights, if: Proc.new { |record, params|
    params && params[:include_insights]
  } do |object, params|
    params[:insights]
  end

  # Include chart data if provided in options
  attribute :chart, if: Proc.new { |record, params|
    params && params[:include_chart]
  } do |object, params|
    params[:chart_data]
  end

  # Include transactions if provided in options
  attribute :transactions, if: Proc.new { |record, params|
    params && params[:include_transactions]
  } do |object, params|
    params[:transactions]
  end

  attribute :has_more, if: Proc.new { |record, params|
    params && params[:include_transactions]
  } do |object, params|
    params[:has_more]
  end
end