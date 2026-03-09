class RunAllRulesJob < ApplicationJob
  def perform(user_id)
    user = User.find(user_id)
    rules = user.rules.enabled.ordered.to_a
    return if rules.empty?

    results = Hash.new { |hash, key| hash[key] = { matched_count: 0, updated_count: 0 } }

    user.transactions.includes(:account, :transaction_category, :tags, :recurring_transaction_links).find_each do |transaction|
      result = Rules::ApplyFirstMatchingRule.new(transaction: transaction, rules: rules).call
      next if result.rule.blank?

      results[result.rule.id][:matched_count] += result.matched_count
      results[result.rule.id][:updated_count] += result.updated_count
    end

    rules.each do |rule|
      counts = results[rule.id]
      rule.mark_run!(status: "completed", matched_count: counts[:matched_count], updated_count: counts[:updated_count])
    end
  rescue => e
    rules&.each do |rule|
      rule.mark_run!(status: "failed", error: e.message)
    end
    raise
  end
end
