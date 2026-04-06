class RulesController < ApplicationController
  before_action :set_rule, only: %i[show update destroy run]

  def index
    render_jsonapi current_user.rules.ordered
  end

  def show
    render_jsonapi @rule
  end

  def create
    rule = current_user.rules.build(rule_params)

    if rule.save
      render_jsonapi rule, status: :created
    else
      render json: { error: rule.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def update
    if @rule.update(rule_params)
      render_jsonapi @rule
    else
      render json: { error: @rule.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def destroy
    @rule.destroy
    head :no_content
  end

  def run
    RunRuleJob.perform_later(@rule.id)
    render json: { message: "Rule queued" }, status: :accepted
  end

  def run_all
    RunAllRulesJob.perform_later(current_user.id)
    render json: { message: "Rules queued" }, status: :accepted
  end

  def reorder
    ordered_ids = Array(params[:ordered_ids]).map(&:to_i)
    rules = current_user.rules.where(id: ordered_ids).index_by(&:id)

    return render json: { error: "Invalid rule list" }, status: :unprocessable_entity if rules.size != ordered_ids.size

    Rule.transaction do
      ordered_ids.each_with_index do |id, index|
        rules.fetch(id).update!(priority: index)
      end
    end

    render_jsonapi current_user.rules.ordered
  end

  private

  def set_rule
    @rule = current_user.rules.find(params[:id])
  end

  def rule_params
    permitted = params.require(:rule).permit(:name, :description, :enabled, :priority, :overwrite_mode)

    permitted[:conditions] = normalize_json_param(params[:rule][:conditions]) if params[:rule].key?(:conditions)
    permitted[:actions] = normalize_json_param(params[:rule][:actions]) if params[:rule].key?(:actions)

    permitted
  end

  def normalize_json_param(value)
    case value
    when ActionController::Parameters
      value.to_unsafe_h.transform_values { |item| normalize_json_param(item) }
    when Array
      value.map { |item| normalize_json_param(item) }
    when Hash
      value.transform_values { |item| normalize_json_param(item) }
    else
      value
    end
  end
end
