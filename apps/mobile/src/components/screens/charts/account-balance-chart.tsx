import { View, Text, TouchableOpacity } from "react-native"
import React from "react"

import { showAmount } from "@/utils/currency"
import Icon from "@/components/ui/icon"

const currencyConfig = {
  USD: { symbol: "$", color: "#2563EB", flag: "🇺🇸" },
  EUR: { symbol: "€", color: "#059669", flag: "🇪🇺" },
  GBP: { symbol: "£", color: "#7C3AED", flag: "🇬🇧" },
  CLP: { symbol: "$", color: "#DC2626", flag: "🇨🇱" },
}

interface AccountBalanceChartProps {
  balanceHistory?: Array<{ date: string; balance: number }>
  currency?: string
  selectedPeriod?: string
  onPeriodChange?: (period: string) => void
  avgIncome?: number
  avgExpenses?: number
  avgBalance?: number
  avgSavings?: number
  loading?: boolean
}

export default function AccountBalanceChart({ 
  balanceHistory = [], 
  currency = "USD", 
  selectedPeriod = "30D", 
  onPeriodChange = () => {},
  avgIncome,
  avgExpenses,
  avgBalance,
  avgSavings,
  loading = false
}: AccountBalanceChartProps) {
  if (loading) {
    return (
      <View className="items-center justify-center py-10">
        <Text className="text-muted-foreground">Loading chart...</Text>
      </View>
    )
  }
  if (!balanceHistory || balanceHistory.length === 0) {
    return null
  }

  const periods = ["1M", "3M", "6M", "1Y"]
  const maxBalance = Math.max(...balanceHistory.map(d => d.balance))
  const minBalance = Math.min(...balanceHistory.map(d => d.balance))
  const balanceRange = maxBalance - minBalance


  const getBalanceHeight = (balance: number) => {
    const minHeight = 20
    const maxHeight = 98
    if (balanceRange === 0) return 60
    const normalized = (balance - minBalance) / balanceRange
    const height = normalized * maxHeight + minHeight
    return Math.min(height, maxHeight + minHeight)
  }

  const currentBalance = balanceHistory[balanceHistory.length - 1]?.balance || 0
  const previousBalance = balanceHistory[0]?.balance || 0
  const balanceChange = currentBalance - previousBalance
  const isPositive = balanceChange >= 0

  return (
    <View className="mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Icon name="TrendingUp" className="text-blue-600 mr-2" size={20} />
          <Text className="text-xl font-semibold text-foreground">Balance History</Text>
        </View>
        <View className="flex-row bg-muted rounded-lg p-1">
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              className={`px-3 py-1.5 rounded-md ${selectedPeriod === period ? "bg-background shadow-sm" : ""}`}
              onPress={() => onPeriodChange(period)}
            >
              <Text className={`text-sm font-medium ${selectedPeriod === period ? "text-foreground" : "text-muted-foreground"}`}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="bg-background border border-border rounded-2xl p-5 mb-3">
        <View className="flex-row justify-between items-end h-36">
          {balanceHistory.map((item: { date: string; balance: number }, index: number) => {
            const height = getBalanceHeight(item.balance)
            const isLatest = index === balanceHistory.length - 1

            return (
              <View key={index} className="items-center flex-1">
                <View className="h-32 w-6 justify-end items-center relative mb-2">
                  <View 
                    className={`w-4 rounded-t-sm absolute bottom-0 ${isLatest ? "bg-blue-600" : "bg-blue-400"}`} 
                    style={{ height }} 
                  />
                </View>
                <Text className="text-xs text-muted-foreground font-medium mb-1">
                  {item.date}
                </Text>
                <View className="flex-row items-center">
                  {isLatest && (
                    <Icon 
                      name={isPositive ? "TrendingUp" : "TrendingDown"} 
                      className={`mr-1 ${isPositive ? "text-green-600" : "text-red-500"}`} 
                      size={12} 
                    />
                  )}
                  <Text className={`text-xs font-semibold ${isLatest ? "text-foreground" : "text-muted-foreground"}`}>
                    {showAmount(item.balance)}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      </View>

      <View className="flex-row justify-center items-center gap-4 bg-background border border-border rounded-xl p-3 mb-4">
        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-blue-600 rounded-full mr-2" />
          <Text className="text-sm text-foreground font-medium">Balance</Text>
        </View>
        <Text className="text-xs text-muted-foreground italic">in {currency}</Text>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 bg-background border border-border rounded-xl p-4 items-center">
          <Icon name="DollarSign" className="text-blue-600 mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Current Balance</Text>
          <Text className="text-base font-bold text-foreground">
            {currencyConfig[currency as keyof typeof currencyConfig]?.symbol}{showAmount(currentBalance)}
          </Text>
        </View>
        <View className="flex-1 bg-background border border-border rounded-xl p-4 items-center">
          <Icon name="TrendingUp" className="text-purple-600 mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Avg Balance</Text>
          <Text className="text-base font-bold text-foreground">
            {currencyConfig[currency as keyof typeof currencyConfig]?.symbol}{showAmount(avgBalance)}
          </Text>
        </View>
        <View className="flex-1 bg-background border border-border rounded-xl p-4 items-center">
          <Icon name={isPositive ? "TrendingUp" : "TrendingDown"} className={`mb-2 ${isPositive ? "text-green-600" : "text-red-500"}`} size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Change</Text>
          <Text className={`text-base font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>
            {isPositive ? "+" : ""}{currencyConfig[currency as keyof typeof currencyConfig]?.symbol}{showAmount(Math.abs(balanceChange))}
          </Text>
        </View>
      </View>

      {/* Show backend-provided averages if available */}
      {(avgIncome !== undefined || avgExpenses !== undefined || avgSavings !== undefined) && (
        <View className="flex-row gap-3 mt-4">
          <View className="flex-1 bg-background border border-border rounded-xl p-4 items-center">
            <Icon name="TrendingUp" className="text-green-600 mb-2" size={20} />
            <Text className="text-xs text-muted-foreground mb-1">Avg Income</Text>
            <Text className="text-base font-bold text-foreground">
              {currencyConfig[currency as keyof typeof currencyConfig]?.symbol}{showAmount(avgIncome || 0)}
            </Text>
          </View>
          <View className="flex-1 bg-background border border-border rounded-xl p-4 items-center">
            <Icon name="TrendingDown" className="text-red-500 mb-2" size={20} />
            <Text className="text-xs text-muted-foreground mb-1">Avg Expenses</Text>
            <Text className="text-base font-bold text-foreground">
              {currencyConfig[currency as keyof typeof currencyConfig]?.symbol}{showAmount(avgExpenses || 0)}
            </Text>
          </View>
          <View className="flex-1 bg-background border border-border rounded-xl p-4 items-center">
            <Icon name="TrendingUp" className="text-purple-600 mb-2" size={20} />
            <Text className="text-xs text-muted-foreground mb-1">Avg Savings</Text>
            <Text className="text-base font-bold text-foreground">
              {currencyConfig[currency as keyof typeof currencyConfig]?.symbol}{showAmount(avgSavings || 0)}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
} 