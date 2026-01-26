import { View, Text } from "react-native"
import React from "react"

import CurrencyFilter from "@/components/ui/CurrencyFilter"
import { useCharts } from "@/context/charts.context"
import { showAmount } from "@/utils/currency"
import Icon from "@/components/ui/icon"


export default function BalanceTrends() {
  const { balanceData, selectedCurrency, setSelectedCurrency, avgIncome, avgExpenses, avgSavings, userCurrencies } = useCharts()

  // Only show currencies with data
  const currencyHasData = (currency: string) =>
    balanceData.some(d => d.income > 0 || d.expenses > 0 || d.net !== 0)

  const availableCurrencies = (userCurrencies || []).map(code => ({
    code,
    disabled: !currencyHasData(code)
  }))

  if (!currencyHasData(selectedCurrency)) {
    return null
  }

  
  React.useEffect(() => {
    const available = availableCurrencies.filter(c => !c.disabled).map(c => c.code)
    if (!available.includes(selectedCurrency) && available.length > 0) {
      setSelectedCurrency(available[0])
    }
  }, [balanceData, availableCurrencies, selectedCurrency, setSelectedCurrency])

  const maxValue = Math.max(...balanceData.map(d => Math.max(d.income, d.expenses)))

  return (
    <View className="mt-6">
      <View className="flex-col  mb-4">
        <View className="flex-row items-center">
          <Icon name="TrendingUp" className="text-purple-600 mr-2" size={20} />
          <Text className="text-xl font-semibold text-foreground">Balance Trends</Text>
        </View>
        <View className="items-start mt-1">
          <CurrencyFilter
            currencies={availableCurrencies}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
        </View>
      </View>

      <View className="bg-background border border-border rounded-2xl p-5 mb-3">
        <View className="flex-row justify-between items-end h-36">
          {balanceData.map((item, index) => {
            const incomeHeight = (item.income / maxValue) * 120
            const expenseHeight = (item.expenses / maxValue) * 120
            const isPositive = item.net > 0
            const showNet = balanceData.length <= 6

            return (
              <View key={index} className="items-center flex-1">
                <View className="h-32 w-6 justify-end items-center relative mb-2">
                  <View className="w-2.5 bg-green-600 rounded-t-sm absolute left-0 bottom-0" style={{ height: incomeHeight }} />
                  <View className="w-2.5 bg-red-500 rounded-t-sm absolute right-0 bottom-0" style={{ height: expenseHeight }} />
                </View>
                <Text className="text-xs text-muted-foreground font-medium mb-1">{(item as any).week ?? item.month}</Text>
                {showNet && (
                  <View className="flex-row items-center">
                    {isPositive ? (
                      <Icon name="TrendingUp" className="text-green-600 mr-1" size={12} />
                    ) : (
                      <Icon name="TrendingDown" className="text-red-500 mr-1" size={12} />
                    )}
                    <Text className={`text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-500"}`}>
                      {Math.abs(item.net)}
                    </Text>
                  </View>
                )}
              </View>
            )
          })}
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 bg-background border border-border rounded-xl p-4 items-center">
          <Icon name="DollarSign" className="text-green-600 mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Avg Income</Text>
          <Text className="text-base font-bold text-foreground">
            {showAmount(avgIncome)}
          </Text>
        </View>
        <View className="flex-1 bg-background border border-border rounded-xl p-4 items-center">
          <Icon name="TrendingDown" className="text-red-500 mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Avg Expenses</Text>
          <Text className="text-base font-bold text-foreground">
            {showAmount(avgExpenses)}
          </Text>
        </View>
        <View className="flex-1 bg-background border border-border rounded-xl p-4 items-center">
          <Icon name="TrendingUp" className="text-purple-600 mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Avg Savings</Text>
          <Text className="text-base font-bold text-foreground">
            {showAmount(avgSavings)}
          </Text>
        </View>
      </View>
    </View>
  )
} 