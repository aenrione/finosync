import { View, ScrollView, RefreshControl, Text } from "react-native"
import { useTranslation } from "react-i18next"
import React from "react"

import RecentTransactions from "@/components/screens/dashboard/recent-transactions"
import SpendingInsights from "@/components/screens/dashboard/spending-insights"
import TotalBalance from "@/components/screens/dashboard/total-balance"
import QuickActions from "@/components/screens/dashboard/quick-actions"
import AccountsList from "@/components/screens/dashboard/accounts-list"
import DashboardHeader from "@/components/screens/dashboard/header"
import { useDashboard } from "@/context/dashboard.context"

export default function DashboardScreen() {
  const { t } = useTranslation()
  const { dashboard, loading, error, refresh } = useDashboard()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-muted-foreground">Loading dashboard...</Text>
      </View>
    )
  }
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-red-500">{error}</Text>
      </View>
    )
  }
  if (!dashboard) {
    return null
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#6B7280"
          />
        }
      >
        <DashboardHeader />
        <TotalBalance balances={dashboard.balances} />
        <QuickActions accounts={dashboard.accounts} />
        <AccountsList accounts={dashboard.accounts} />
        <RecentTransactions transactions={dashboard.recent_transactions} />
        <SpendingInsights insights={dashboard.spending_insights} currencies={dashboard.user_currencies} />
      </ScrollView>
    </View>
  )
}

