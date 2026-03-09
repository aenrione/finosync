module Rules
  class ConditionMatcher
    class << self
      def matches?(condition_node:, transaction:)
        node = condition_node.deep_stringify_keys

        return match_group(node, transaction) if node["children"].present?

        match_leaf(node, transaction)
      end

      private

      def match_group(node, transaction)
        results = Array(node["children"]).map do |child|
          matches?(condition_node: child, transaction: transaction)
        end

        return false if results.empty?

        node["logic"].to_s.downcase == "or" ? results.any? : results.all?
      end

      def match_leaf(node, transaction)
        field = node["field"].to_s
        operator = node["operator"].to_s
        value = node["value"]

        case field
        when "merchant", "description"
          compare_text(transaction_search_text(transaction), operator, value)
        when "amount"
          compare_numeric(transaction.amount.to_f, operator, value)
        when "account_id"
          compare_equality(transaction.account_id, value)
        when "transaction_category_id"
          compare_equality(transaction.transaction_category_id, value)
        when "transaction_type"
          compare_text(transaction.transaction_type, operator.presence || "eq", value)
        else
          false
        end
      end

      def transaction_search_text(transaction)
        [ transaction.description, transaction.holder_name, transaction.holder_institution ].compact.join(" ")
      end

      def compare_text(source, operator, value)
        source_text = source.to_s.downcase
        value_text = value.to_s.downcase

        case operator
        when "contains"
          source_text.include?(value_text)
        when "equals", "eq"
          source_text == value_text
        when "starts_with"
          source_text.start_with?(value_text)
        when "ends_with"
          source_text.end_with?(value_text)
        else
          false
        end
      end

      def compare_numeric(source, operator, value)
        numeric_value = value.to_f

        case operator
        when "eq"
          source == numeric_value
        when "gt"
          source > numeric_value
        when "gte"
          source >= numeric_value
        when "lt"
          source < numeric_value
        when "lte"
          source <= numeric_value
        else
          false
        end
      end

      def compare_equality(source, value)
        source.to_s == value.to_s
      end
    end
  end
end
