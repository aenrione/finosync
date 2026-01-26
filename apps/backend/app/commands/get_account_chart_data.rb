class GetAccountChartData < PowerTypes::Command.new(:account, :time_range)
  def perform
    @end_date = Date.current
    @time_range ||= "6M"

    if @time_range == "1M"
      build_weekly_chart_data
    else
      build_monthly_chart_data
    end
  end

  private

  def build_weekly_chart_data
    weeks = 4
    balance_data = []

    weeks.times do |i|
      week_start = @end_date - (weeks - i - 1).weeks
      week_end = week_start.end_of_week

      week_snapshot = @account.versions.where(
        "created_at >= ? AND created_at <= ?", week_start, week_end
      ).order(:created_at).last

      data_point = if week_snapshot
        obj = week_snapshot.reify
        build_chart_data_point(week_start.strftime("%b %d"), obj)
      else
        latest_snapshot = @account.versions.where(
          "created_at <= ?", week_end
        ).order(:created_at).last

        if latest_snapshot
          obj = latest_snapshot.reify
          build_chart_data_point(week_start.strftime("%b %d"), obj)
        else
          build_empty_chart_data_point(week_start.strftime("%b %d"))
        end
      end

      balance_data << data_point
    end

    build_chart_response_with_averages(balance_data)
  end

  def build_monthly_chart_data
    months_back = case @time_range
    when "3M" then 3
    when "6M" then 6
    when "1Y" then 12
    else 6
    end

    balance_data = []

    months_back.times do |i|
      month_start = @end_date - i.months
      month_end = month_start.end_of_month

      month_snapshot = @account.versions.where(
        "created_at >= ? AND created_at <= ?", month_start, month_end
      ).order(:created_at).last

      data_point = if month_snapshot
        obj = month_snapshot.reify
        build_chart_data_point(month_start.strftime("%b"), obj)
      else
        latest_snapshot = @account.versions.where(
          "created_at <= ?", month_end
        ).order(:created_at).last

        if latest_snapshot
          obj = latest_snapshot.reify
          build_chart_data_point(month_start.strftime("%b"), obj)
        else
          build_empty_chart_data_point(month_start.strftime("%b"))
        end
      end

      balance_data.unshift(data_point)
    end

    build_chart_response_with_averages(balance_data, include_avg_balance: true)
  end

  def build_chart_data_point(label, obj)
    {
      label: label,
      balance: obj.balance.round(2),
      income: obj.income.round(2),
      expenses: obj.expense.round(2),
      net: (obj.income - obj.expense).round(2)
    }
  end

  def build_empty_chart_data_point(label)
    {
      label: label,
      balance: 0,
      income: 0,
      expenses: 0,
      net: 0
    }
  end

  def build_chart_response_with_averages(balance_data, include_avg_balance: false)
    return empty_chart_response if balance_data.empty?

    avg_income = (balance_data.sum { |d| d[:income].to_f } / balance_data.size).round(2)
    avg_expenses = (balance_data.sum { |d| d[:expenses].to_f } / balance_data.size).round(2)
    avg_savings = (balance_data.sum { |d| d[:net].to_f } / balance_data.size).round(2)

    response = {
      balance: balance_data,
      avgIncome: avg_income,
      avgExpenses: avg_expenses,
      avgSavings: avg_savings,
      avgBalance: nil
    }

    if include_avg_balance && balance_data.first && balance_data.first[:balance]
      response[:avgBalance] = (balance_data.sum { |d| d[:balance].to_f } / balance_data.size).round(2)
    end

    response
  end

  def empty_chart_response
    {
      balance: [],
      avgIncome: 0,
      avgExpenses: 0,
      avgSavings: 0,
      avgBalance: nil
    }
  end
end
