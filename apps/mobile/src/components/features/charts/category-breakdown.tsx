import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import React from "react";
import { PieChart } from "react-native-gifted-charts";

import { useCharts } from "@/context/charts.context";
import { getCurrencyMeta, showAmount } from "@/utils/currency";
import Icon from "@/components/ui/icon";

export default function CategoryBreakdown() {
  const {
    expenseData,
    incomeData,
    baseCurrency,
    showIncome,
    setShowIncome,
  } = useCharts();
  const { width: screenWidth } = useWindowDimensions();

  const currentData = showIncome ? incomeData : expenseData;
  const currentTotal = currentData.reduce((sum, item) => sum + item.amount, 0);
  const currencyMeta = getCurrencyMeta(baseCurrency);
  const sorted = [...currentData].sort((a, b) => b.amount - a.amount);

  if (currentData.length === 0) return null;

  const pieData = sorted.map((item) => ({
    value: item.amount,
    color: item.color,
    text: `${Math.round((item.amount / currentTotal) * 100)}%`,
  }));

  const radius = Math.min(screenWidth * 0.2, 80);

  return (
    <View className="mt-6">
      {/* Header with toggle */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Icon name="ChartPie" className="text-primary mr-2" size={20} />
          <Text className="text-xl font-semibold text-foreground">
            Categories
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${!showIncome ? "bg-primary" : "bg-card border border-border"}`}
            onPress={() => setShowIncome(false)}
          >
            <Text
              className={`text-sm font-medium ${!showIncome ? "text-white" : "text-muted-foreground"}`}
            >
              Expenses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${showIncome ? "bg-primary" : "bg-card border border-border"}`}
            onPress={() => setShowIncome(true)}
          >
            <Text
              className={`text-sm font-medium ${showIncome ? "text-white" : "text-muted-foreground"}`}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-card rounded-2xl border border-border p-4">
        {/* Donut + Total */}
        <View className="items-center mb-4">
          <PieChart
            data={pieData}
            donut
            radius={radius}
            innerRadius={radius * 0.6}
            innerCircleColor="#FFFFFF"
            centerLabelComponent={() => (
              <View className="items-center justify-center">
                <Text className="text-xs text-muted-foreground">
                  {showIncome ? "Income" : "Spent"}
                </Text>
                <Text className="text-base font-bold font-mono text-foreground" numberOfLines={1}>
                  {currencyMeta.symbol}{showAmount(currentTotal)}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Monarch-style progress bars */}
        <View className="gap-3">
          {sorted.map((item) => {
            const pct = currentTotal > 0 ? (item.amount / currentTotal) * 100 : 0;
            return (
              <View key={item.name}>
                <View className="flex-row justify-between items-center mb-1.5">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="w-3 h-3 rounded-full mr-2.5"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-sm text-foreground" numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm font-mono font-semibold text-foreground mr-2">
                      {currencyMeta.symbol}{showAmount(item.amount)}
                    </Text>
                    <Text className="text-xs font-mono text-muted-foreground w-10 text-right">
                      {Math.round(pct)}%
                    </Text>
                  </View>
                </View>
                <View className="h-2 bg-muted rounded-full">
                  <View
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
