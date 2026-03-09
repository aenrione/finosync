import { View, Text, ScrollView } from "react-native";
import React from "react";

import { useCharts } from "@/context/charts.context";
import { showAmount } from "@/utils/currency";
import Icon from "@/components/ui/icon";

export default function CurrencyOverview() {
  const { currencyOverview } = useCharts();

  if (currencyOverview.length === 0) {
    return null;
  }

  return (
    <View className="mt-6">
      <View className="flex-row items-center mb-4">
        <Icon name="Globe" className="text-primary mr-2" size={20} />
        <Text className="text-xl font-semibold text-foreground">
          Currency Overview
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2"
      >
        {currencyOverview.map((item) => (
          <View
            key={item.currency}
            className="bg-card rounded-2xl p-4 border border-border mr-3 min-w-[160px]"
          >
            <View className="flex-row items-center mb-3">
              <Text className="text-xl mr-2">{item.flag}</Text>
              <Text className="text-base font-bold text-foreground">
                {item.currency}
              </Text>
            </View>
            <View className="space-y-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-muted-foreground">Income</Text>
                <Text className="text-sm font-mono font-semibold text-success">
                  {showAmount(item.income)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-muted-foreground">Expenses</Text>
                <Text className="text-sm font-mono font-semibold text-destructive">
                  {showAmount(item.expenses)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-muted-foreground">Net</Text>
                <Text
                  className={`text-sm font-mono font-semibold ${item.net >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {item.net >= 0 ? "+" : "-"}
                  {showAmount(Math.abs(item.net))}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
