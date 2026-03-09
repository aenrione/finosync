module Rules
  class ApplyFirstMatchingRule
    Result = Struct.new(:rule, :matched_count, :updated_count)

    def initialize(transaction:, rules: nil)
      @transaction = transaction
      @rules = rules || @transaction.account.user.rules.enabled.ordered
    end

    def call
      @rules.each do |rule|
        next unless ConditionMatcher.matches?(condition_node: rule.conditions, transaction: @transaction)

        execution = ActionExecutor.new(rule: rule, transaction: @transaction).call
        return Result.new(rule, 1, execution.updated_count)
      end

      Result.new(nil, 0, 0)
    end
  end
end
