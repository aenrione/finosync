import { ScrollView, RefreshControl, View, Text } from "react-native";
import React from "react";
import { router } from "expo-router";

import RouteErrorState from "@/components/errors/route-error-state";
import StaleDataBanner from "@/components/errors/stale-data-banner";
import ScreenHeader from "@/components/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { useCharts } from "@/context/charts.context";
import { colors } from "@/lib/colors";
import { getCurrencyMeta, showAmount } from "@/utils/currency";
import Icon from "@/components/ui/icon";

import TimeRangeSelector from "./time-range-selector";
import CategoryBreakdown from "./category-breakdown";
import CashFlowChart from "./cash-flow-chart";

export default function ChartsScreen() {
  const {
    loading,
    error,
    refreshing,
    isStale,
    lastUpdated,
    refreshData,
    expenseData,
    incomeData,
    balanceData,
    avgIncome,
    avgExpenses,
    avgSavings,
    baseCurrency,
  } = useCharts();
  const amountSymbol = getCurrencyMeta(baseCurrency).symbol;

  const handleRefresh = async () => {
    await refreshData();
  };

  const hasChartData =
    expenseData.length > 0 ||
    incomeData.length > 0 ||
    balanceData.length > 0 ||
    avgIncome !== 0 ||
    avgExpenses !== 0 ||
    avgSavings !== 0;

  if (loading && !refreshing && !hasChartData) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="small" />
        <Text className="text-muted-foreground mt-4">Loading charts...</Text>
      </View>
    );
  }

  if (error && !hasChartData) {
    return (
      <RouteErrorState
        error={error}
        title="Couldn't load cash flow"
        onRetry={handleRefresh}
        onSecondaryAction={() =>
          router.replace("/(app)/(drawer)/(tabs)/dashboard")
        }
        secondaryLabel="Open dashboard"
      />
    );
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
      <ScreenHeader variant="drawer" title="Cash Flow" />
      <View className="px-5 pt-4 pb-8">
        {isStale ? <StaleDataBanner updatedAt={lastUpdated} /> : null}

        {error && hasChartData ? (
          <View className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3">
            <Text className="text-sm font-semibold text-foreground">
              Cash flow is offline
            </Text>
            <Text className="mt-1 text-xs leading-5 text-muted-foreground">
              {error}
            </Text>
          </View>
        ) : null}

        <TimeRangeSelector />

        {/* Net Savings Hero */}
        <View className="bg-card rounded-2xl border border-border p-5 mt-2 mb-2 items-center">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Net Savings
          </Text>
          <Text
            className={`text-3xl font-mono font-bold ${avgSavings >= 0 ? "text-income" : "text-expense"}`}
          >
            {showAmount(avgSavings, true, amountSymbol)}
          </Text>
        </View>

        <View className="flex-row gap-3 mt-2">
          <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
            <Icon name="TrendingUp" className="text-income mb-3" size={18} />
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Income
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {showAmount(avgIncome, true, amountSymbol)}
            </Text>
          </View>
          <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
            <Icon name="TrendingDown" className="text-expense mb-3" size={18} />
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Expenses
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {showAmount(avgExpenses, true, amountSymbol)}
            </Text>
          </View>
          <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
            <Icon name="PiggyBank" className="text-primary mb-3" size={18} />
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Savings
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {showAmount(avgSavings, true, amountSymbol)}
            </Text>
          </View>
        </View>

        <CashFlowChart />
        <CategoryBreakdown />
      </View>
    </ScrollView>
  );
}
