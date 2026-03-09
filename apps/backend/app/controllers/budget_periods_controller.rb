class BudgetPeriodsController < ApplicationController
  def show
    year = (params[:year] || Date.current.year).to_i
    month = (params[:month] || Date.current.month).to_i
    currency = params[:currency].presence || "CLP"

    period = current_user.budget_periods.find_or_create_by!(year: year, month: month)
    start_date = period.start_date
    end_date = period.end_date
    categories = current_user.transaction_categories.includes(:category_group).index_by(&:id)

    # Actual spend per category for this month (only non-ignored transactions)
    actuals = current_user.transactions
      .joins(:account)
      .where(accounts: { currency: currency })
      .where(transaction_date: start_date..end_date, ignore: false)
      .group(:transaction_category_id)
      .sum(:amount)

    # All allocations for this period
    allocations = period.budget_allocations.includes(transaction_category: :category_group)

    # All category groups
    groups = current_user.category_groups

    # Compute income: sum of positive transactions this month
    total_income = actuals.select { |_id, amt| amt > 0 }.values.sum.to_f

    income_category_ids = categories.values
      .select { |category| category.is_income? || category.category_group&.income? }
      .map(&:id)

    budgeted_expense_allocations = allocations.reject do |allocation|
      income_category_ids.include?(allocation.transaction_category_id)
    end

    total_planned = budgeted_expense_allocations
      .sum { |a| a.planned_amount.to_f }

    total_actual = actuals
      .reject { |id, amt| income_category_ids.include?(id) }
      .select { |_id, amt| amt < 0 }
      .values.sum.abs.to_f

    left_to_budget = total_income - total_planned

    grouped_budgeted_allocations = budgeted_expense_allocations.group_by do |allocation|
      allocation.transaction_category.category_group_id
    end

    groups_data = groups
      .reject(&:income?)
      .map do |group|
        group_allocations = grouped_budgeted_allocations[group.id]
        next if group_allocations.blank?

        build_group_summary(
          group: serialize_group(group),
          allocations: group_allocations,
          actuals: actuals,
        )
      end
      .compact

    ungrouped_allocations = grouped_budgeted_allocations[nil] || []

    if ungrouped_allocations.any?
      groups_data << build_group_summary(
        group: {
          id: 0,
          name: "Uncategorized",
          display_order: groups.maximum(:display_order).to_i + 1,
          group_type: "expense"
        },
        allocations: ungrouped_allocations,
        actuals: actuals,
      )
    end

    # Unbudgeted categories: have expense activity but no allocation for the month
    budgeted_cat_ids = budgeted_expense_allocations.map(&:transaction_category_id)

    unbudgeted = actuals
      .select { |id, amount| amount.to_f < 0 && !income_category_ids.include?(id) }
      .reject { |id, _| budgeted_cat_ids.include?(id) }
      .map do |cat_id, amount|
        cat = categories[cat_id]
        next unless cat

        {
          id: cat.id,
          name: cat.name,
          icon: cat.icon || "FileQuestion",
          actual_spend: amount < 0 ? amount.abs.to_f : 0.0
        }
      end
      .compact
      .sort_by { |category| -category[:actual_spend] }

    render json: {
      period: {
        id: period.id,
        year: period.year,
        month: period.month,
        status: period.status,
        start_date: start_date.iso8601,
        end_date: end_date.iso8601
      },
      left_to_budget: left_to_budget,
      total_income: total_income,
      total_planned: total_planned,
      total_actual: total_actual,
      groups: groups_data,
      unbudgeted_categories: unbudgeted
    }, status: :ok
  end

  def copy_previous
    year = params[:year].to_i
    month = params[:month].to_i

    current_period = current_user.budget_periods.find_or_create_by!(year: year, month: month)

    # Find previous month
    prev_date = Date.new(year, month, 1) - 1.month
    prev_period = current_user.budget_periods.find_by(year: prev_date.year, month: prev_date.month)

    unless prev_period
      return render json: { error: "No previous month budget found" }, status: :not_found
    end

    # Copy allocations
    prev_period.budget_allocations.each do |alloc|
      current_period.budget_allocations.find_or_create_by!(
        transaction_category_id: alloc.transaction_category_id
      ) do |new_alloc|
        new_alloc.planned_amount = alloc.planned_amount
        new_alloc.notes = alloc.notes
      end
    end

    # Return the updated budget summary by redirecting to show
    redirect_to action: :show, year: year, month: month
  end

  private

  def serialize_group(group)
    {
      id: group.id,
      name: group.name,
      display_order: group.display_order,
      group_type: group.group_type
    }
  end

  def serialize_allocation(allocation, actuals)
    category = allocation.transaction_category
    actual = actuals[category.id]&.to_f || 0.0
    actual_spend = actual < 0 ? actual.abs : 0.0
    planned = allocation.planned_amount.to_f

    {
      id: allocation.id,
      planned_amount: planned,
      actual_spend: actual_spend,
      remaining: planned - actual_spend,
      rollover_in: allocation.rollover_in.to_f,
      transaction_category_id: category.id,
      category_name: category.name,
      category_icon: category.icon || "FileQuestion",
      notes: allocation.notes
    }
  end

  def build_group_summary(group:, allocations:, actuals:)
    serialized_allocations = allocations
      .sort_by { |allocation| allocation.transaction_category.name.downcase }
      .map { |allocation| serialize_allocation(allocation, actuals) }

    {
      group: group,
      allocations: serialized_allocations,
      group_total_planned: serialized_allocations.sum { |allocation| allocation[:planned_amount] },
      group_total_actual: serialized_allocations.sum { |allocation| allocation[:actual_spend] },
      group_total_remaining: serialized_allocations.sum { |allocation| allocation[:remaining] }
    }
  end
end
