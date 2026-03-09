import { View, Text, useWindowDimensions } from "react-native"
import { BarChart } from "react-native-gifted-charts"
import React, { useMemo, useState, useCallback } from "react"

import {
  getCurrencyMeta,
  parseNumericAmount,
  showAmount,
} from "@/utils/currency"
import { useCharts } from "@/context/charts.context"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"
import { colors } from "@/lib/colors"

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  local: { label: "Cash", color: colors.income },
  fintoc: { label: "Banking", color: colors.accountFintoc },
  fintual: { label: "Investments", color: colors.investment },
  buda: { label: "Crypto", color: colors.crypto },
}

const DIMMED_COLORS: Record<string, string> = {
  [colors.income]: "#10B98140",
  [colors.accountFintoc]: "#06B6D440",
  [colors.investment]: "#8B5CF640",
  [colors.crypto]: "#F59E0B40",
}

type BalanceItem = {
  currency: string;
  label?: string;
  symbol?: string;
  balance: string | number;
  changePct?: number;
};

export default function NetWorthChart({
  balances,
}: {
  balances?: BalanceItem[];
}) {
  const { accountBalances, baseCurrency, loading, timeRange } = useCharts()
  const { width: screenWidth } = useWindowDimensions()
  const [containerWidth, setContainerWidth] = useState(screenWidth - 40)
  const lastBarIndex = (accountBalances?.[0]?.labels?.length ?? 1) - 1
  const [selectedIndex, setSelectedIndex] = useState(lastBarIndex)
  const isVisible = useStore((state) => state.isVisible)
  const isCurrentMonth = selectedIndex === lastBarIndex

  const handleBarPress = useCallback(
    (index: number) => {
      setSelectedIndex(index)
    },
    [],
  )

  const {
    stackData,
    lineData,
    typeKeys,
    maxValue,
    minValue,
    totals,
    labels,
    breakdown,
    latestLabel,
    displayIndex,
  } = useMemo(() => {
    if (!accountBalances || accountBalances.length === 0) {
      return {
        stackData: [],
        lineData: [],
        typeKeys: [],
        maxValue: 0,
        minValue: 0,
        totals: [],
        labels: [],
        breakdown: [],
        latestLabel: "",
        displayIndex: 0,
      }
    }

    const refLabels = accountBalances[0]?.labels || []
    if (refLabels.length === 0) {
      return {
        stackData: [],
        lineData: [],
        typeKeys: [],
        maxValue: 0,
        minValue: 0,
        totals: [],
        labels: [],
        breakdown: [],
        latestLabel: "",
        displayIndex: 0,
      }
    }

    const grouped: Record<string, number[]> = {}
    for (const acct of accountBalances) {
      const type = acct.account_type || "local"
      if (!grouped[type]) {
        grouped[type] = new Array(refLabels.length).fill(0)
      }

      acct.data.forEach((value, i) => {
        const val = Number(value) || 0
        grouped[type][i] += val
      })
    }

    const keys = Object.keys(grouped).filter(
      (k) => TYPE_CONFIG[k] && grouped[k].some((v) => v !== 0),
    )

    if (keys.length === 0) {
      return {
        stackData: [],
        lineData: [],
        typeKeys: [],
        maxValue: 0,
        minValue: 0,
        totals: [],
        labels: [],
        breakdown: [],
        latestLabel: "",
        displayIndex: 0,
      }
    }

    const stacks = refLabels.map((label, i) => ({
      stacks: keys.map((type, typeIdx) => {
        const baseColor = TYPE_CONFIG[type].color
        const isDimmed = selectedIndex !== i
        const isLast = typeIdx === keys.length - 1
        return {
          value: grouped[type][i],
          color: isDimmed ? (DIMMED_COLORS[baseColor] ?? baseColor) : baseColor,
          onPress: () => handleBarPress(i),
          ...(isLast ? { borderTopLeftRadius: 4, borderTopRightRadius: 4 } : {}),
        }
      }),
      label,
    }))

    const totals = refLabels.map((_, i) =>
      keys.reduce((sum, type) => sum + grouped[type][i], 0),
    )

    const line = totals.map((total) => ({ value: total }))

    const values = [...totals, ...keys.flatMap((type) => grouped[type])]
    const lastIndex = refLabels.length - 1

    const breakdownForIndex = (idx: number) =>
      keys
        .map((type) => ({
          key: type,
          label: TYPE_CONFIG[type].label,
          color: TYPE_CONFIG[type].color,
          value: grouped[type][idx] ?? 0,
        }))
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))

    const displayIndex = selectedIndex
    const latestBreakdown = breakdownForIndex(displayIndex)

    return {
      stackData: stacks,
      lineData: line,
      typeKeys: keys,
      maxValue: Math.max(0, ...values),
      minValue: Math.min(0, ...values),
      totals,
      labels: refLabels,
      breakdown: latestBreakdown,
      latestLabel: refLabels[lastIndex] ?? "",
      displayIndex,
    }
  }, [accountBalances, selectedIndex, handleBarPress])

  if (loading || stackData.length === 0) return null

  const balance = balances?.[0]
  const currencyCode = balance?.currency || baseCurrency
  const currencyMeta = getCurrencyMeta(currencyCode)
  const currencySymbol = balance?.symbol || currencyMeta.symbol

  const displayTotal = totals[displayIndex] ?? 0
  const prevTotal = displayIndex > 0 ? totals[displayIndex - 1] : null
  const parsedBalance = parseNumericAmount(balance?.balance)
  const currentTotal = isCurrentMonth
    ? displayTotal || parsedBalance || 0
    : displayTotal
  const changeAmount = prevTotal === null ? null : currentTotal - prevTotal
  const fallbackChangePct = (() => {
    if (changeAmount === null || prevTotal === null || prevTotal === 0) {
      return null
    }
    return (changeAmount / prevTotal) * 100
  })()
  const changePct = isCurrentMonth
    ? (balance?.changePct ?? fallbackChangePct)
    : fallbackChangePct
  const hasChange = changeAmount !== null && changePct !== null
  const isPositive = (changeAmount ?? 0) >= 0
  const trendLabel = timeRange === "1M" ? "vs prior week" : "vs prior period"
  const formattedTotal = showAmount(currentTotal, isVisible, currencySymbol)
  const formattedChange =
    changeAmount === null
      ? null
      : showAmount(Math.abs(changeAmount), isVisible, currencySymbol)
  const displayPeriodLabel = labels?.[displayIndex] ?? ""

  const chartWidth = Math.max(220, containerWidth - 64)
  const barWidth = Math.max(
    16,
    Math.min(30, chartWidth / Math.max(stackData.length, 1) - 20),
  )
  const chartEdgeSpacing = 18
  const chartMaxValue = maxValue > 0 ? maxValue * 1.12 : undefined
  const chartMostNegativeValue =
    minValue < 0 ? Math.abs(minValue) * 1.12 : undefined

  return (
    <View className="px-5 mt-6 mb-2">
      <View
        className="bg-card rounded-2xl border border-border p-5"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon name="TrendingUp" className="text-primary" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">
                  Net Worth
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {currencyMeta.name} ({currencySymbol}) snapshot
                </Text>
              </View>
            </View>

            <Text className="mt-4 text-3xl font-bold font-mono text-foreground">
              {formattedTotal}
            </Text>

            {hasChange && formattedChange ? (
              <View className="mt-2 flex-row flex-wrap items-center gap-2">
                <View
                  className={`flex-row items-center rounded-full px-3 py-1 ${isPositive ? "bg-success/10" : "bg-destructive/10"}`}
                >
                  <Icon
                    name={isPositive ? "TrendingUp" : "TrendingDown"}
                    className={isPositive ? "text-success" : "text-destructive"}
                    size={14}
                  />
                  <Text
                    className={`ml-1 text-xs font-semibold ${isPositive ? "text-success" : "text-destructive"}`}
                  >
                    {isPositive ? "+" : "-"}
                    {formattedChange}
                  </Text>
                </View>
                <Text
                  className={`text-sm font-medium ${isPositive ? "text-success" : "text-destructive"}`}
                >
                  {isPositive ? "+" : ""}
                  {changePct.toFixed(1)}% {trendLabel}
                </Text>
              </View>
            ) : (
              <Text className="mt-2 text-sm text-muted-foreground">
                Updated {latestLabel || "recently"}
              </Text>
            )}
          </View>
        </View>

        {breakdown.length > 0 ? (
          <View className="mt-4 flex-row flex-wrap justify-between">
            {breakdown.map((item) => (
              <View
                key={item.key}
                className="mb-3 rounded-xl border border-border bg-background px-3 py-3"
                style={{ width: "48%" }}
              >
                <View className="flex-row items-center">
                  <View
                    className="mr-2 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-xs font-medium uppercase text-muted-foreground">
                    {item.label}
                  </Text>
                </View>
                <Text className="mt-2 text-sm font-semibold text-foreground">
                  {showAmount(item.value, isVisible, currencySymbol)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mb-4 mt-1 h-px bg-border" />

        <View className="mb-3 flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-foreground">
              Net Worth Trend
            </Text>
            <Text className="text-xs text-muted-foreground">
              Stacked balances with total overlay
            </Text>
          </View>
          {latestLabel ? (
            <Text className="text-xs font-medium text-muted-foreground">
              {isCurrentMonth ? `Latest ${latestLabel}` : displayPeriodLabel}
            </Text>
          ) : null}
        </View>

        <BarChart
          stackData={stackData}
          width={chartWidth}
          barWidth={barWidth}
          spacing={Math.max(8, chartWidth / stackData.length - barWidth)}
          initialSpacing={chartEdgeSpacing}
          endSpacing={chartEdgeSpacing}
          noOfSections={4}
          maxValue={chartMaxValue}
          mostNegativeValue={chartMostNegativeValue}
          stackBorderTopLeftRadius={4}
          stackBorderTopRightRadius={4}
          xAxisThickness={0}
          yAxisThickness={0}
          xAxisLabelsHeight={20}
          xAxisLabelsVerticalShift={4}
          yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
          formatYLabel={(label) => {
            const val = Number(label)
            if (Math.abs(val) >= 1000000)
              return `${(val / 1000000).toFixed(1)}M`
            if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(0)}k`
            return label
          }}
          hideRules={false}
          rulesColor={colors.border}
          rulesType="dashed"
          showLine
          lineData={lineData}
          lineConfig={{
            color: colors.foreground,
            thickness: 2.5,
            curved: true,
            hideDataPoints: false,
            dataPointsColor: colors.foreground,
            dataPointsRadius: 3,
          }}
          disableScroll
        />

        <View className="flex-row flex-wrap gap-3 mt-3 justify-center">
          {typeKeys.map((type) => (
            <View key={type} className="flex-row items-center">
              <View
                className="w-2.5 h-2.5 rounded-full mr-1.5"
                style={{ backgroundColor: TYPE_CONFIG[type].color }}
              />
              <Text className="text-xs text-muted-foreground">
                {TYPE_CONFIG[type].label}
              </Text>
            </View>
          ))}
          <View className="flex-row items-center">
            <View
              className="w-2.5 h-2.5 rounded-full mr-1.5"
              style={{ backgroundColor: colors.foreground }}
            />
            <Text className="text-xs text-muted-foreground">Net Worth</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
