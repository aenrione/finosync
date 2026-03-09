import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native"
import { LineChart } from "react-native-gifted-charts"
import React, { useMemo, useState } from "react"

import {
  getCurrencyMeta,
  parseNumericAmount,
  showAmount,
} from "@/utils/currency"
import { useCharts } from "@/context/charts.context"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"
import { colors } from "@/lib/colors"

type CategoryItem = {
  name?: string;
  category?: string;
  amount?: string | number;
};

type PeriodInsight = {
  total_spent?: string | number;
  total_earned?: string | number;
  top_categories?: CategoryItem[];
};

type SpendingInsights = {
  this_month?: PeriodInsight;
  last_month?: PeriodInsight;
};

type MetricMode = "expense" | "income";
type ViewMode = "categories" | "time";

type SeriesPoint = {
  value: number;
  label?: string;
};

type ChartViewData = {
  currentTotal: number;
  secondaryTotal: number;
  secondaryLabel: string;
  changeAmount: number;
  changePct: number | null;
  changeLabel: string;
  insightChip?: string;
  pointsCount: number;
  line: SeriesPoint[];
  maxValue?: number;
};

const formatCompactAmount = (value: number) => {
  const absolute = Math.abs(value)

  if (absolute >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }

  if (absolute >= 1000) {
    return `${(value / 1000).toFixed(0)}k`
  }

  return `${Math.round(value)}`
}

const truncateLabel = (label: string) => {
  if (label.length <= 10) return label
  return `${label.slice(0, 9)}...`
}

const getMetricColor = (metricMode: MetricMode) => metricMode === "income" ? colors.success : colors.primary

export default function SpendingComparisonChart({
  insights,
}: {
  insights?: SpendingInsights;
}) {
  const {
    expenseData,
    incomeData,
    balanceData,
    avgExpenses,
    avgIncome,
    timeRange,
  } = useCharts()
  const { width: screenWidth } = useWindowDimensions()
  const [containerWidth, setContainerWidth] = useState(screenWidth - 40)
  const [metricMode, setMetricMode] = useState<MetricMode>("expense")
  const [viewMode, setViewMode] = useState<ViewMode>("categories")
  const isVisible = useStore((state) => state.isVisible)
  const baseCurrency = useStore((state) => state.baseCurrency)

  const categoryData = useMemo<ChartViewData | null>(() => {
    const source = metricMode === "expense" ? expenseData : incomeData

    if (!source || source.length === 0) {
      return null
    }

    const currentTotalFromInsights = parseNumericAmount(
      metricMode === "expense"
        ? insights?.this_month?.total_spent
        : insights?.this_month?.total_earned,
    )
    const previousTotalFromInsights = parseNumericAmount(
      metricMode === "expense"
        ? insights?.last_month?.total_spent
        : insights?.last_month?.total_earned,
    )
    const fallbackTotal = source.reduce((sum, item) => sum + item.amount, 0)
    const currentTotal = currentTotalFromInsights ?? fallbackTotal
    const previousTotal = previousTotalFromInsights ?? 0
    const changeAmount = currentTotal - previousTotal
    const changePct =
      previousTotal > 0 ? (changeAmount / previousTotal) * 100 : null
    const topItems = [...source]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
    const topLabel = topItems[0]?.name
    const maxValue = Math.max(...topItems.map((item) => item.amount), 0)

    return {
      currentTotal,
      secondaryTotal: previousTotal,
      secondaryLabel: "Last month",
      changeAmount,
      changePct,
      changeLabel: "vs last month",
      insightChip: topLabel
        ? `${metricMode === "expense" ? "Top spend" : "Top income"}: ${topLabel}`
        : undefined,
      pointsCount: topItems.length,
      line: topItems.map((item) => ({
        value: item.amount,
        label: truncateLabel(item.name),
      })),
      maxValue: maxValue > 0 ? maxValue * 1.15 : undefined,
    }
  }, [expenseData, incomeData, insights, metricMode])

  const timeData = useMemo<ChartViewData | null>(() => {
    if (!balanceData || balanceData.length === 0) {
      return null
    }

    const points = balanceData.map((item) => ({
      label: item.week || item.month || "",
      value:
        metricMode === "income"
          ? Number(item.income) || 0
          : Math.abs(Number(item.expenses) || 0),
    }))

    if (points.length === 0) {
      return null
    }

    const currentTotal = points[points.length - 1]?.value ?? 0
    const previousTotal =
      points.length > 1 ? (points[points.length - 2]?.value ?? 0) : 0
    const average = metricMode === "income" ? avgIncome : avgExpenses
    const changeAmount = currentTotal - previousTotal
    const changePct =
      previousTotal > 0 ? (changeAmount / previousTotal) * 100 : null
    const peakPoint = points.reduce(
      (peak, point) => (point.value > peak.value ? point : peak),
      points[0],
    )
    const maxValue = Math.max(
      ...points.map((point) => point.value),
      average,
      0,
    )

    return {
      currentTotal,
      secondaryTotal: average,
      secondaryLabel: "Average",
      changeAmount,
      changePct,
      changeLabel: timeRange === "1M" ? "vs prior week" : "vs prior period",
      insightChip: peakPoint.value > 0 ? `Peak: ${peakPoint.label}` : undefined,
      pointsCount: points.length,
      line: points,
      maxValue: maxValue > 0 ? maxValue * 1.15 : undefined,
    }
  }, [avgExpenses, avgIncome, balanceData, metricMode, timeRange])

  const activeData =
    viewMode === "time"
      ? (timeData ?? categoryData)
      : (categoryData ?? timeData)

  if (!activeData) {
    return null
  }

  const chartWidth = Math.max(220, containerWidth - 48)
  const spacing =
    activeData.pointsCount > 1
      ? Math.max(38, chartWidth / (activeData.pointsCount + 0.4))
      : chartWidth / 2
  const accentColor = getMetricColor(metricMode)
  const isUp = activeData.changeAmount >= 0
  const currencySymbol = getCurrencyMeta(baseCurrency).symbol
  const title = metricMode === "income" ? "Income" : "Spending"
  const comparisonText =
    activeData.changePct === null
      ? `${isUp ? "+" : "-"}${showAmount(
        Math.abs(activeData.changeAmount),
        isVisible,
        currencySymbol,
      )}`
      : `${isUp ? "+" : "-"}${Math.abs(activeData.changePct).toFixed(1)}%`
  const footerText = `${activeData.secondaryLabel}: ${showAmount(
    activeData.secondaryTotal,
    isVisible,
    currencySymbol,
  )}`

  return (
    <View className="px-5 mt-2 mb-2">
      <View
        className="rounded-3xl border border-border bg-card p-5"
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-lg font-semibold text-foreground">{title}</Text>

          <View className="flex-row self-start rounded-full border border-border bg-background p-1">
            {[
              { key: "expense", label: "Spending" },
              { key: "income", label: "Income" },
            ].map((option) => {
              const active = metricMode === option.key

              return (
                <TouchableOpacity
                  key={option.key}
                  className={`rounded-full px-3 py-1.5 ${active ? "bg-primary" : "bg-transparent"}`}
                  onPress={() => setMetricMode(option.key as MetricMode)}
                >
                  <Text
                    className={`text-xs font-semibold ${active ? "text-white" : "text-muted-foreground"}`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View className="mt-3 flex-row flex-wrap items-center gap-x-3 gap-y-2">
          <Text className="text-3xl font-bold font-mono text-foreground">
            {showAmount(activeData.currentTotal, isVisible, currencySymbol)}
          </Text>

          <View className="flex-row items-center">
            <Icon
              name={isUp ? "TrendingUp" : "TrendingDown"}
              className={isUp ? "text-destructive" : "text-success"}
              size={14}
            />
            <Text
              className={`ml-1 text-sm font-semibold ${
                isUp ? "text-destructive" : "text-success"
              }`}
            >
              {comparisonText}
            </Text>
            <Text className="ml-1 text-sm text-muted-foreground">
              {activeData.changeLabel}
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row self-start rounded-full border border-border bg-background p-1">
          {[
            { key: "categories", label: "By category" },
            { key: "time", label: "Over time" },
          ].map((option) => {
            const active = viewMode === option.key

            return (
              <TouchableOpacity
                key={option.key}
                className={`rounded-full px-3 py-1.5 ${active ? "bg-primary" : "bg-transparent"}`}
                onPress={() => setViewMode(option.key as ViewMode)}
              >
                <Text
                  className={`text-xs font-semibold ${active ? "text-white" : "text-muted-foreground"}`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View className="mt-4 rounded-[28px] bg-background/80 px-3 pb-2 pt-4">
          <LineChart
            width={chartWidth}
            height={220}
            data={activeData.line}
            color={accentColor}
            thickness={3}
            curved
            areaChart
            startFillColor={accentColor}
            endFillColor={accentColor}
            startOpacity={0.16}
            endOpacity={0.02}
            dataPointsColor={accentColor}
            dataPointsRadius={4}
            spacing={spacing}
            initialSpacing={18}
            endSpacing={18}
            noOfSections={4}
            maxValue={activeData.maxValue}
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
            xAxisLabelTextStyle={{
              color: colors.mutedForeground,
              fontSize: 11,
            }}
            rulesColor={colors.border}
            rulesType="dashed"
            hideRules={false}
            formatYLabel={(label) => formatCompactAmount(Number(label))}
            disableScroll
            isAnimated
            animateOnDataChange
          />
        </View>

        <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2">
          <Text className="text-sm text-muted-foreground">{footerText}</Text>

          {activeData.insightChip ? (
            <View className="rounded-full border border-border bg-background px-3 py-1">
              <Text className="text-xs font-medium text-muted-foreground">
                {activeData.insightChip}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  )
}
