import { View, ScrollView, RefreshControl } from "react-native";
import React from "react";
import { router } from "expo-router";

import RouteErrorState from "@/components/errors/route-error-state";
import StaleDataBanner from "@/components/errors/stale-data-banner";
import SpendingComparisonChart from "@/components/features/dashboard/spending-comparison-chart";
import UpcomingRecurringCard from "@/components/features/dashboard/upcoming-recurring-card";
import BudgetProgressCards from "@/components/features/dashboard/budget-progress-cards";
import NetWorthChart from "@/components/features/dashboard/net-worth-chart";
import DashboardHeader from "@/components/features/dashboard/header";
import { useDashboard } from "@/context/dashboard.context";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";

export default function DashboardScreen() {
  const {
    dashboard,
    loading,
    refreshing,
    error,
    isStale,
    lastUpdated,
    refresh,
  } = useDashboard();

  if (loading && !dashboard) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="large" />
        <Text className="text-lg text-muted-foreground mt-4">
          Loading dashboard...
        </Text>
      </View>
    );
  }
  if (error && !dashboard) {
    return (
      <RouteErrorState
        error={error}
        title="Couldn't load dashboard"
        onRetry={refresh}
        onSecondaryAction={() =>
          router.replace("/(app)/(drawer)/(tabs)/accounts")
        }
        secondaryLabel="Open accounts"
      />
    );
  }
  if (!dashboard) {
    return null;
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {isStale ? (
          <View className="px-5 pt-4">
            <StaleDataBanner updatedAt={lastUpdated} />
          </View>
        ) : null}
        <DashboardHeader />
        <NetWorthChart balances={dashboard.balances} />
        <SpendingComparisonChart insights={dashboard.spending_insights} />
        <BudgetProgressCards />
        <UpcomingRecurringCard />
      </ScrollView>
    </View>
  );
}
