# == Schema Information
#
# Table name: rules
#
#  id                     :integer          not null, primary key
#  actions                :json             not null
#  conditions             :json             not null
#  description            :text
#  enabled                :boolean          default(TRUE), not null
#  last_error             :text
#  last_run_at            :datetime
#  last_run_matched_count :integer          default(0), not null
#  last_run_status        :string
#  last_run_updated_count :integer          default(0), not null
#  name                   :string           not null
#  overwrite_mode         :string           default("fill_blanks"), not null
#  priority               :integer          default(0), not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  user_id                :integer          not null
#
# Indexes
#
#  index_rules_on_user_id               (user_id)
#  index_rules_on_user_id_and_priority  (user_id,priority)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
class Rule < ApplicationRecord
  STRING_OPERATORS = %w[contains equals starts_with ends_with].freeze
  NUMERIC_OPERATORS = %w[eq gt gte lt lte].freeze
  EQUALITY_OPERATORS = %w[eq].freeze
  VALID_FIELDS = %w[merchant description amount account_id transaction_category_id transaction_type].freeze
  ACTION_TYPES = %w[assign_category add_tags link_recurring_transaction].freeze
  OVERWRITE_MODES = %w[fill_blanks].freeze

  belongs_to :user

  scope :enabled, -> { where(enabled: true) }
  scope :ordered, -> { order(:priority, :created_at) }

  validates :name, presence: true
  validates :overwrite_mode, inclusion: { in: OVERWRITE_MODES }
  validate :conditions_must_be_valid
  validate :actions_must_be_valid
  validate :references_must_belong_to_user

  before_validation :assign_default_priority, on: :create

  def mark_run!(status:, matched_count: 0, updated_count: 0, error: nil)
    update!(
      last_run_at: Time.current,
      last_run_status: status,
      last_run_matched_count: matched_count,
      last_run_updated_count: updated_count,
      last_error: error
    )
  end

  def transactions_scope
    user.transactions.includes(:account, :transaction_category, :tags, :recurring_transaction_links)
  end

  private

  def assign_default_priority
    return unless priority.nil?

    self.priority = (user&.rules&.maximum(:priority) || -1) + 1
  end

  def conditions_must_be_valid
    if conditions.blank? || !conditions.is_a?(Hash)
      errors.add(:conditions, "must be a condition group")
      return
    end

    validate_condition_node(conditions)
  end

  def validate_condition_node(node)
    node = node.deep_stringify_keys

    if node["children"].present?
      logic = node["logic"].to_s.downcase
      errors.add(:conditions, "must use and/or logic") unless %w[and or].include?(logic)

      children = node["children"]
      if !children.is_a?(Array) || children.empty?
        errors.add(:conditions, "must include children")
        return
      end

      children.each { |child| validate_condition_node(child) }
      return
    end

    field = node["field"].to_s
    operator = node["operator"].to_s
    value = node["value"]

    unless VALID_FIELDS.include?(field)
      errors.add(:conditions, "contains an unsupported field")
      return
    end

    valid_operators = operators_for(field)
    errors.add(:conditions, "contains an unsupported operator") unless valid_operators.include?(operator)
    errors.add(:conditions, "contains a blank value") if value.blank?
  end

  def actions_must_be_valid
    if !actions.is_a?(Array) || actions.empty?
      errors.add(:actions, "must include at least one action")
      return
    end

    actions.each do |action|
      action = action.deep_stringify_keys
      action_type = action["type"].to_s
      errors.add(:actions, "contains an unsupported action") unless ACTION_TYPES.include?(action_type)

      case action_type
      when "assign_category"
        errors.add(:actions, "must include a category") if action["transaction_category_id"].blank?
      when "add_tags"
        tag_ids = action["tag_ids"]
        errors.add(:actions, "must include at least one tag") unless tag_ids.is_a?(Array) && tag_ids.any?
      when "link_recurring_transaction"
        errors.add(:actions, "must include a recurring transaction") if action["recurring_transaction_id"].blank?
      end
    end
  end

  def references_must_belong_to_user
    return if user.blank?

    validate_condition_references(conditions.deep_stringify_keys) if conditions.is_a?(Hash)

    Array(actions).each do |action|
      action = action.deep_stringify_keys

      case action["type"]
      when "assign_category"
        validate_category_reference(action["transaction_category_id"])
      when "add_tags"
        validate_tag_references(action["tag_ids"])
      when "link_recurring_transaction"
        validate_recurring_reference(action["recurring_transaction_id"])
      end
    end
  end

  def validate_condition_references(node)
    if node["children"].present?
      node["children"].each { |child| validate_condition_references(child.deep_stringify_keys) }
      return
    end

    case node["field"]
    when "account_id"
      validate_account_reference(node["value"])
    when "transaction_category_id"
      validate_category_reference(node["value"])
    end
  end

  def validate_account_reference(value)
    return if value.blank?
    return if user.accounts.exists?(id: value)

    errors.add(:base, "account must belong to user")
  end

  def validate_category_reference(value)
    return if value.blank?
    return if user.transaction_categories.exists?(id: value)

    errors.add(:base, "category must belong to user")
  end

  def validate_tag_references(value)
    return if value.blank?

    tag_ids = Array(value).map(&:to_i)
    return if tag_ids.size == user.tags.where(id: tag_ids).count

    errors.add(:base, "tags must belong to user")
  end

  def validate_recurring_reference(value)
    return if value.blank?
    return if user.recurring_transactions.exists?(id: value)

    errors.add(:base, "recurring transaction must belong to user")
  end

  def operators_for(field)
    case field
    when "amount"
      NUMERIC_OPERATORS
    when "account_id", "transaction_category_id", "transaction_type"
      EQUALITY_OPERATORS
    else
      STRING_OPERATORS
    end
  end
end
