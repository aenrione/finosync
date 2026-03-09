import React from "react";
import { View } from "react-native";

import Icon from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { getCurrencyMeta, showAmount } from "@/utils/currency";
import { useStore } from "@/utils/store";

type Props = {
  leftToBudget: number;
  totalIncome: number;
  totalPlanned: number;
  totalActual: number;
};

export default function BudgetSummaryCard({
  leftToBudget,
  totalIncome,
  totalPlanned,
  totalActual,
}: Props) {
  const isVisible = useStore((s) => s.isVisible);
  const baseCurrency = useStore((s) => s.baseCurrency);
  const sym = getCurrencyMeta(baseCurrency).symbol;
  const isPositive = leftToBudget >= 0;

  return (
    <View className="mx-5 bg-card rounded-2xl p-5 shadow-sm">
      {/* Left to Budget - Hero */}
      <View className="items-center mb-4">
        <Text className="text-sm text-muted-foreground mb-1">Left to Budget</Text>
        <Text
          className={`text-3xl font-bold font-mono ${isPositive ? "text-income" : "text-expense"}`}
        >
          {showAmount(leftToBudget, isVisible, sym)}
        </Text>
      </View>

      {/* Secondary Stats */}
      <View className="flex-row border-t border-border pt-4">
        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-1">
            <Icon name="TrendingUp" size={14} className="text-income mr-1" />
            <Text className="text-xs text-muted-foreground">Income</Text>
          </View>
          <Text className="text-sm font-semibold font-mono text-foreground">
            {showAmount(totalIncome, isVisible, sym)}
          </Text>
        </View>

        <View className="flex-1 items-center border-l border-border">
          <View className="flex-row items-center mb-1">
            <Icon name="Target" size={14} className="text-primary mr-1" />
            <Text className="text-xs text-muted-foreground">Planned</Text>
          </View>
          <Text className="text-sm font-semibold font-mono text-foreground">
            {showAmount(totalPlanned, isVisible, sym)}
          </Text>
        </View>

        <View className="flex-1 items-center border-l border-border">
          <View className="flex-row items-center mb-1">
            <Icon name="TrendingDown" size={14} className="text-expense mr-1" />
            <Text className="text-xs text-muted-foreground">Spent</Text>
          </View>
          <Text className="text-sm font-semibold font-mono text-foreground">
            {showAmount(totalActual, isVisible, sym)}
          </Text>
        </View>
      </View>
    </View>
  );
}
