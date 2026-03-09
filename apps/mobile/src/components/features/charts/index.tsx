import { ScrollView, RefreshControl, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { router } from "expo-router";

import RouteErrorState from "@/components/errors/route-error-state";
import StaleDataBanner from "@/components/errors/stale-data-banner";
import ScreenHeader from "@/components/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { useCharts } from "@/context/charts.context";
import { colors } from "@/lib/colors";
import { getCurrencyFormat, getCurrencyMeta, showAmount } from "@/utils/currency";
import StatCard from "@/components/ui/stat-card";

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
    selectedPeriods,
  } = useCharts();
  const amountSymbol = getCurrencyMeta(baseCurrency).symbol;

  const hasSelection = selectedPeriods.length > 0;
  const selectedItems = hasSelection
    ? balanceData.filter((b) => selectedPeriods.includes(b.week ?? b.month ?? ""))
    : [];
  const displayIncome = hasSelection
    ? selectedItems.reduce((sum, b) => sum + (Number(b.income) || 0), 0)
    : avgIncome;
  const displayExpenses = hasSelection
    ? selectedItems.reduce((sum, b) => sum + Math.abs(Number(b.expenses) || 0), 0)
    : avgExpenses;
  const displaySavings = hasSelection
    ? displayIncome - displayExpenses
    : avgSavings;
  const showAvg = selectedItems.length > 1;
  const { maxDecimals } = getCurrencyFormat(baseCurrency);
  const roundForCurrency = (v: number) => {
    const factor = 10 ** maxDecimals;
    return Math.round(v * factor) / factor;
  };
  const avgDisplayIncome = showAvg ? roundForCurrency(displayIncome / selectedItems.length) : 0;
  const avgDisplayExpenses = showAvg ? roundForCurrency(displayExpenses / selectedItems.length) : 0;
  const avgDisplaySavings = showAvg ? roundForCurrency(displaySavings / selectedItems.length) : 0;
  const summaryLabel = hasSelection ? selectedPeriods.join(", ") : null;

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
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Spinner size="small" />
        <Text className="text-muted-foreground mt-4">Loading charts...</Text>
      </SafeAreaView>
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
    <SafeAreaView className="flex-1 bg-background">
    <ScrollView
      className="flex-1"
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

        <CashFlowChart />

        {summaryLabel ? (
          <Text className="text-xs text-muted-foreground mt-4 mb-1 ml-1">
            Showing {summaryLabel}
          </Text>
        ) : null}
        <View className={`flex-row gap-3 ${summaryLabel ? "mt-1" : "mt-4"}`}>
          <StatCard
            iconName="DollarSign"
            iconClass="text-success"
            label="Income"
            value={showAmount(displayIncome, true, amountSymbol)}
            subValue={showAvg ? `≈ ${showAmount(avgDisplayIncome, true, amountSymbol)}` : undefined}
          />
          <StatCard
            iconName="TrendingDown"
            iconClass="text-destructive"
            label="Expenses"
            value={showAmount(displayExpenses, true, amountSymbol)}
            subValue={showAvg ? `≈ ${showAmount(avgDisplayExpenses, true, amountSymbol)}` : undefined}
          />
          <StatCard
            iconName="TrendingUp"
            iconClass="text-primary"
            label="Savings"
            value={showAmount(displaySavings, true, amountSymbol)}
            subValue={showAvg ? `≈ ${showAmount(avgDisplaySavings, true, amountSymbol)}` : undefined}
          />
        </View>

        <CategoryBreakdown />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
