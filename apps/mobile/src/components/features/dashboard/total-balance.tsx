import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import React from "react"

import { useDashboard } from "@/context/dashboard.context"
import { showAmount } from "@/utils/currency"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"

export type BalanceItem = {
  currency: string
  label?: string
  symbol?: string
  balance: string | number
  changePct?: number
}

export default function TotalBalance({ balances }: { balances: BalanceItem[] }) {
  if (!balances || balances.length === 0) {
    return null
  }

  const {refresh} = useDashboard()
  const isVisible = useStore((state) => state.isVisible)

  return (
    <View className="px-5 mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-foreground">Total Balance</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity activeOpacity={0.7} onPress={refresh} className="p-2 rounded-full bg-muted">
            <View className="w-9 h-9 rounded-full bg-muted justify-center items-center">
              <Icon name="RefreshCw" className="text-muted-foreground" size={20} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {balances.map((bal) => (
          <View key={bal.currency} className="bg-background border border-border rounded-2xl p-5 mr-4 min-w-[200px] shadow-sm">
            <View className="flex-row items-center mb-3">
              <Text className="text-sm font-semibold text-muted-foreground">{bal.label || bal.currency}</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2">
              {showAmount(bal.balance, isVisible)}
            </Text>
            {
              bal.changePct && (
                <View className="flex-row items-center">
                  <Icon name="TrendingUp" className="text-success mr-1" size={16} />
                  <Text className="text-sm text-success font-medium">{bal.changePct ? `+${bal.changePct}% this month` : ""}</Text>
                </View>
              )
            }
          </View>
        ))}
      </ScrollView>
    </View>
  )
} 