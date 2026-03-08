import { ScrollView, RefreshControl, View, Text } from "react-native"
import { useTranslation } from "react-i18next"
import React from "react"

import { Spinner } from "@/components/ui/spinner"
import { useCharts } from "@/context/charts.context"
import { colors } from "@/lib/colors"

import AccountBalanceChart from "./account-balance-chart"
import TimeRangeSelector from "./time-range-selector"
import CategoryPieChart from "./category-pie-chart"
import CurrencyOverview from "./currency-overview"
import BalanceTrends from "./balance-trends"

export default function ChartsScreen() {
  const { t } = useTranslation()
  const { loading, error, refreshing, refreshData } = useCharts()

  const handleRefresh = async () => {
    await refreshData()
  }

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="small" />
        <Text className="text-muted-foreground mt-4">Loading charts...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-destructive text-lg text-center mb-4">Error loading charts</Text>
        <Text className="text-muted-foreground text-center mb-4">{error}</Text>
        <Text className="text-muted-foreground text-center">Pull down to refresh</Text>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.mutedForeground}
          colors={[colors.mutedForeground]}
        />
      }
    >
      <View className="px-5 pt-6 pb-8">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Financial Analytics</Text>
          <Text className="text-base text-muted-foreground">Track your multi-currency performance</Text>
        </View>
        
        <TimeRangeSelector />
        <CurrencyOverview />
        <AccountBalanceChart />
        <CategoryPieChart />
        <BalanceTrends />
      </View>
    </ScrollView>
  )
}
