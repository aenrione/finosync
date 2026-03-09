import { ScrollView, RefreshControl, View, Text } from "react-native";
import React from "react";

import ScreenHeader from "@/components/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { useCharts } from "@/context/charts.context";
import { colors } from "@/lib/colors";
import { showAmount } from "@/utils/currency";
import Icon from "@/components/ui/icon";

import TimeRangeSelector from "./time-range-selector";
import CategoryBreakdown from "./category-breakdown";
import CashFlowChart from "./cash-flow-chart";

export default function ChartsScreen() {
  const {
    loading,
    error,
    refreshing,
    refreshData,
    avgIncome,
    avgExpenses,
    avgSavings,
  } = useCharts();

  const handleRefresh = async () => {
    await refreshData();
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="small" />
        <Text className="text-muted-foreground mt-4">Loading charts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-destructive text-lg text-center mb-4">
          Error loading charts
        </Text>
        <Text className="text-muted-foreground text-center mb-4">{error}</Text>
        <Text className="text-muted-foreground text-center">
          Pull down to refresh
        </Text>
      </View>
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

        <TimeRangeSelector />

        {/* Net Savings Hero */}
        <View className="bg-card rounded-2xl border border-border p-5 mt-2 mb-2 items-center">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Net Savings
          </Text>
          <Text
            className={`text-3xl font-mono font-bold ${avgSavings >= 0 ? "text-income" : "text-expense"}`}
          >
            {showAmount(avgSavings)}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Income {showAmount(avgIncome)} − Expenses {showAmount(avgExpenses)}
          </Text>
        </View>

        <View className="flex-row gap-3 mt-2">
          <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
            <Icon name="TrendingUp" className="text-income mb-3" size={18} />
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Income
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {showAmount(avgIncome)}
            </Text>
          </View>
          <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
            <Icon name="TrendingDown" className="text-expense mb-3" size={18} />
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Expenses
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {showAmount(avgExpenses)}
            </Text>
          </View>
          <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
            <Icon name="PiggyBank" className="text-primary mb-3" size={18} />
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Savings
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {showAmount(avgSavings)}
            </Text>
          </View>
        </View>

        <CashFlowChart />
        <CategoryBreakdown />
      </View>
    </ScrollView>
  );
}
