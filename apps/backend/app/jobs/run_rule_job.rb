class RunRuleJob < ApplicationJob
  def perform(rule_id)
    rule = Rule.find(rule_id)
    matched_count = 0
    updated_count = 0

    rule.transactions_scope.find_each do |transaction|
      next unless Rules::ConditionMatcher.matches?(condition_node: rule.conditions, transaction: transaction)

      matched_count += 1
      updated_count += Rules::ActionExecutor.new(rule: rule, transaction: transaction).call.updated_count
    end

    rule.mark_run!(status: "completed", matched_count: matched_count, updated_count: updated_count)
  rescue => e
    rule&.mark_run!(status: "failed", matched_count: matched_count || 0, updated_count: updated_count || 0, error: e.message)
    raise
  end
end
