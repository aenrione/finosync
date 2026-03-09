class RecurringTransactionSerializer
  include JSONAPI::Serializer
  attributes :id, :name, :currency, :frequency, :start_date, :end_date,
             :next_due_date, :is_active, :transaction_type, :auto_create,
             :notes, :transaction_category_id, :account_id,
             :created_at, :updated_at

  attribute :amount do |object|
    object.amount.to_f
  end

  attribute :formatted_amount do |object|
    object.recurring_amount.format
  end

  attribute :account_name do |object|
    object.account&.account_name
  end

  attribute :category do |object|
    if object.transaction_category.present?
      {
        id: object.transaction_category.id,
        name: object.transaction_category.name
      }
    end
  end

  attribute :linked_transaction_count do |object|
    object.recurring_transaction_links.count
  end
end
