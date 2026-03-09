import { View, Text, useWindowDimensions } from "react-native"
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react"
import { BarChart } from "react-native-gifted-charts"

import { showAmount, getCurrencyMeta } from "@/utils/currency"
import { colors } from "@/lib/colors"
import Icon from "@/components/ui/icon"

const GREY_BAR = "#B0BEC5"

type BalanceDataPoint = {
  label: string
  balance?: number
  income?: number
  expenses?: number
  net?: number
}

interface AccountBalanceChartProps {
  balanceData?: BalanceDataPoint[]
  currency?: string
  avgIncome?: number
  avgExpenses?: number
  avgBalance?: number
  avgSavings?: number
  loading?: boolean
}

export default function AccountBalanceChart({
  balanceData = [],
  currency = "USD",
  avgIncome,
  avgExpenses,
  avgBalance,
  avgSavings,
  loading = false,
}: AccountBalanceChartProps) {
  const { width: screenWidth } = useWindowDimensions()
  const [containerWidth, setContainerWidth] = useState(screenWidth - 40)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const initializedRef = useRef(false)
  const amountSymbol = getCurrencyMeta(currency).symbol

  // Auto-select last bar when data loads
  useEffect(() => {
    if (balanceData.length > 0 && !initializedRef.current) {
      initializedRef.current = true
      setSelectedIndex(balanceData.length - 1)
    }
  }, [balanceData])

  const hasSelection = selectedIndex !== null

  const handleBarPress = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index))
  }, [])

  // Compute summary values from selected month
  const selected = hasSelection ? balanceData[selectedIndex] : null

  const displayBalance = selected
    ? Number(selected.balance) || 0
    : (avgBalance ?? 0)
  const displayIncome = selected
    ? Number(selected.income) || 0
    : (avgIncome ?? 0)
  const displayExpenses = selected
    ? Math.abs(Number(selected.expenses) || 0)
    : Math.abs(avgExpenses ?? 0)
  const displaySavings = selected
    ? displayIncome - displayExpenses
    : (avgSavings ?? 0)

  // Balance change (first to last)
  const currentBalance = balanceData[balanceData.length - 1]?.balance ?? 0
  const previousBalance = balanceData[0]?.balance ?? 0
  const balanceChange = currentBalance - previousBalance
  const isPositive = balanceChange >= 0

  const { barData, lineData, chartMaxValue } = useMemo(() => {
    if (!balanceData || balanceData.length === 0) {
      return { barData: [], lineData: [], chartMaxValue: 0 }
    }

    const bars = balanceData.map((item, index) => {
      const balance = Number(item.balance) || 0
      const isSelected = !hasSelection || selectedIndex === index
      return {
        value: balance,
        label: item.label,
        frontColor: isSelected ? colors.primary : GREY_BAR,
        onPress: () => handleBarPress(index),
      }
    })

    const line = balanceData.map((item) => ({
      value: Number(item.balance) || 0,
    }))

    const maxVal = Math.max(0, ...bars.map((b) => b.value))

    return {
      barData: bars,
      lineData: line,
      chartMaxValue: maxVal * 1.12,
    }
  }, [balanceData, hasSelection, selectedIndex, handleBarPress])

  if (loading) {
    return (
      <View className="items-center justify-center py-10">
        <Text className="text-muted-foreground">Loading chart...</Text>
      </View>
    )
  }

  if (barData.length === 0) return null

  const chartWidth = Math.max(220, containerWidth - 64)
  const barWidth = Math.max(
    18,
    Math.min(32, chartWidth / Math.max(barData.length, 1) - 18),
  )
  const chartEdgeSpacing = 18
  const chartSpacing = Math.max(
    8,
    chartWidth / Math.max(barData.length, 1) - barWidth,
  )
  const yAxisLabelWidth = 40
  const customLabelWidth = Math.max(48, barWidth + 20)
  const labelCenterNudge = Math.min(14, chartSpacing * 0.5)

  return (
    <View className="mt-6">
      <View className="flex-row items-center mb-3">
        <Icon name="TrendingUp" className="text-primary mr-2" size={20} />
        <View>
          <Text className="text-xl font-semibold text-foreground">
            Balance History
          </Text>
          <Text className="text-xs text-muted-foreground">
            Last 6 months in {currency}
          </Text>
        </View>
      </View>

      <View
        className="bg-card rounded-2xl border border-border p-4"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <View className="mb-4 flex-row flex-wrap justify-end gap-3">
          <View className="flex-row items-center">
            <View
              className="mr-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <Text className="text-xs text-muted-foreground">Balance</Text>
          </View>
          <View className="flex-row items-center">
            <View
              className="mr-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colors.foreground }}
            />
            <Text className="text-xs text-muted-foreground">Trend</Text>
          </View>
        </View>

        <BarChart
          data={barData}
          width={chartWidth}
          barWidth={barWidth}
          barBorderTopLeftRadius={8}
          barBorderTopRightRadius={8}
          spacing={chartSpacing}
          initialSpacing={chartEdgeSpacing}
          endSpacing={chartEdgeSpacing}
          noOfSections={4}
          maxValue={chartMaxValue || undefined}
          yAxisLabelWidth={yAxisLabelWidth}
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: "transparent", fontSize: 11 }}
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
            color: hasSelection ? colors.border : colors.foreground,
            thickness: 3.5,
            curved: true,
            curvature: 0.12,
            hideDataPoints: false,
            dataPointsColor: hasSelection ? colors.border : colors.foreground,
            dataPointsRadius: 4,
          }}
          disableScroll
        />

        <View
          className="relative h-5"
          style={{
            marginLeft: yAxisLabelWidth,
            marginTop: 8,
            width: chartWidth,
          }}
        >
          {barData.map((item, index) => {
            const centerX =
              chartEdgeSpacing +
              barWidth / 2 +
              index * (barWidth + chartSpacing) +
              labelCenterNudge

            return (
              <View
                key={`${item.label}-${index}`}
                style={{
                  position: "absolute",
                  left: centerX - customLabelWidth / 2,
                  width: customLabelWidth,
                }}
              >
                <Text
                  className="text-center text-xs text-muted-foreground"
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* Balance stats */}
      <View className="flex-row gap-3 mt-4">
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center justify-between">
          <View className="items-center">
            <Icon name="DollarSign" className="text-primary mb-2" size={20} />
            <Text className="text-xs text-muted-foreground mb-1" numberOfLines={1}>
              {hasSelection ? "Balance" : "Current"}
            </Text>
          </View>
          <Text
            className="text-base font-mono font-bold text-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {showAmount(hasSelection ? displayBalance : currentBalance, true, amountSymbol)}
          </Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center justify-between">
          <View className="items-center">
            <Icon name="TrendingUp" className="text-primary mb-2" size={20} />
            <Text className="text-xs text-muted-foreground mb-1" numberOfLines={1}>Avg Balance</Text>
          </View>
          <Text
            className="text-base font-mono font-bold text-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {showAmount(avgBalance ?? 0, true, amountSymbol)}
          </Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center justify-between">
          <View className="items-center">
            <Icon
              name={isPositive ? "TrendingUp" : "TrendingDown"}
              className={`mb-2 ${isPositive ? "text-success" : "text-destructive"}`}
              size={20}
            />
            <Text className="text-xs text-muted-foreground mb-1" numberOfLines={1}>Change</Text>
          </View>
          <Text
            className={`text-base font-mono font-bold ${isPositive ? "text-success" : "text-destructive"}`}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {isPositive ? "+" : ""}{showAmount(balanceChange, true, amountSymbol)}
          </Text>
        </View>
      </View>

      {/* Income / Expenses / Savings stats */}
      <View className="flex-row gap-3 mt-3">
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center justify-between">
          <View className="items-center">
            <Icon name="DollarSign" className="text-success mb-2" size={20} />
            <Text className="text-xs text-muted-foreground mb-1" numberOfLines={1}>Income</Text>
          </View>
          <Text
            className="text-base font-mono font-bold text-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {showAmount(displayIncome, true, amountSymbol)}
          </Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center justify-between">
          <View className="items-center">
            <Icon name="TrendingDown" className="text-destructive mb-2" size={20} />
            <Text className="text-xs text-muted-foreground mb-1" numberOfLines={1}>Expenses</Text>
          </View>
          <Text
            className="text-base font-mono font-bold text-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {showAmount(displayExpenses, true, amountSymbol)}
          </Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center justify-between">
          <View className="items-center">
            <Icon name="TrendingUp" className="text-primary mb-2" size={20} />
            <Text className="text-xs text-muted-foreground mb-1" numberOfLines={1}>Savings</Text>
          </View>
          <Text
            className="text-base font-mono font-bold text-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {showAmount(displaySavings, true, amountSymbol)}
          </Text>
        </View>
      </View>
    </View>
  )
}
