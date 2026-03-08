import { View, Text } from "react-native"
import React, { useState } from "react"

import CurrencyFilter from "@/components/ui/currency-filter"
import PeriodDropdown from "@/components/ui/period-dropdown"
import { showAmount } from "@/utils/currency"
import { Category } from "@/types/category"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"

const periodOptions = [
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
]

export default function SpendingInsights({ insights, currencies }: { insights: any, currencies: any }) {
  const [selectedCurrency, setSelectedCurrency] = useState(currencies?.[0]?.code || "")
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0].value)

  if (!insights || !currencies || currencies.length === 0) return null

  const isVisible = useStore((state) => state.isVisible)
  const data = insights[selectedCurrency]?.[selectedPeriod]

  return (
    <View className="px-5 mb-6 mt-2">
      {/* Section Header */}
      <View className="flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-foreground">Spending Insights</Text>
        <PeriodDropdown
          options={periodOptions}
          selectedValue={selectedPeriod}
          onValueChange={setSelectedPeriod}
        />
      </View>
      <CurrencyFilter
        currencies={currencies}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
      />

      {/* Insights Card */}
      <View className="bg-card rounded-xl p-5 border border-border shadow-sm mb-6">
        {/* Row: Total Spent & Total Earned */}
        <View className="flex-row mb-5">
          {/* Total Spent */}
          <View className="flex-1 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-destructive/10 justify-center items-center mr-3">
              <Icon name="TrendingDown" size={20} className="text-destructive" />
            </View>
            <View>
              <Text className="text-sm text-muted-foreground mb-0.5">Total Spent</Text>
              <Text className="text-lg font-bold text-foreground">{data && showAmount(data.total_spent, isVisible)}</Text>
            </View>
          </View>
          {/* Total Earned */}
          <View className="flex-1 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-success/10 justify-center items-center mr-3">
              <Icon name="TrendingUp" size={20} className="text-success" />
            </View>
            <View>
              <Text className="text-sm text-muted-foreground mb-0.5">Total Earned</Text>
              <Text className="text-lg font-bold text-foreground">{data && showAmount(data.total_earned, isVisible)}</Text>
            </View>
          </View>
        </View>
        {/* Category Breakdown */}
        <View className="border-t border-border pt-4">
          <Text className="text-base font-semibold text-foreground mb-3">Top Categories</Text>
          <View className="space-y-3">
            {(!data || !data.top_categories || data.top_categories.length === 0) && (
              <Text className="text-muted-foreground text-sm">No categories yet</Text>
            )}
            {data && data.top_categories && data.top_categories.map((cat: Category & { amount: number }) => (
              <View key={cat.id} className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className={"w-3 h-3 rounded-full mr-3 bg-muted-foreground"} />
                  <Text className="text-sm text-muted-foreground">{cat.name}</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground">{
                  showAmount(cat.amount, isVisible)
                }</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}