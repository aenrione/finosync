import { View, ScrollView, RefreshControl } from "react-native"
import { useTranslation } from "react-i18next"
import React from "react"

import RecentTransactions from "@/components/features/dashboard/recent-transactions"
import SpendingInsights from "@/components/features/dashboard/spending-insights"
import TotalBalance from "@/components/features/dashboard/total-balance"
import QuickActions from "@/components/features/dashboard/quick-actions"
import AccountsList from "@/components/features/dashboard/accounts-list"
import DashboardHeader from "@/components/features/dashboard/header"
import { useDashboard } from "@/context/dashboard.context"
import { Spinner } from "@/components/ui/spinner"
import { Text } from "@/components/ui/text"

export default function DashboardScreen() {
  const { t } = useTranslation()
  const { dashboard, loading, error, refresh } = useDashboard()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="large" />
        <Text className="text-lg text-muted-foreground mt-4">Loading dashboard...</Text>
      </View>
    )
  }
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-destructive">{error}</Text>
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
