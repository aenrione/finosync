module Rules
  class ActionExecutor
    Result = Struct.new(:updated_count)

    def initialize(rule:, transaction:)
      @rule = rule
      @transaction = transaction
      @updated_count = 0
    end

    def call
      Rule.transaction do
        Array(@rule.actions).each do |action|
          execute_action(action.deep_stringify_keys)
        end
      end

      Result.new(@updated_count)
    end

    private

    def execute_action(action)
      case action["type"]
      when "assign_category"
        assign_category(action["transaction_category_id"])
      when "add_tags"
        add_tags(action["tag_ids"])
      when "link_recurring_transaction"
        link_recurring_transaction(action["recurring_transaction_id"])
      end
    end

    def assign_category(category_id)
      return if @transaction.transaction_category_id.present?

      category = @rule.user.transaction_categories.find_by(id: category_id)
      return if category.blank?

      @transaction.update!(transaction_category: category)
      @updated_count += 1
    end

    def add_tags(tag_ids)
      tags = @rule.user.tags.where(id: Array(tag_ids))
      tags.each do |tag|
        next if @transaction.tags.exists?(tag.id)

        @transaction.tags << tag
        @updated_count += 1
      end
    end

    def link_recurring_transaction(recurring_transaction_id)
      return if @transaction.recurring_transaction_links.exists?

      recurring_transaction = @rule.user.recurring_transactions.find_by(id: recurring_transaction_id)
      return if recurring_transaction.blank?

      recurring_transaction.recurring_transaction_links.create!(linked_transaction: @transaction)
      @updated_count += 1
    end
  end
end
