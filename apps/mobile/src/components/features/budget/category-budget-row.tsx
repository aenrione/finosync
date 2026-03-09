import React from "react";
import { TouchableOpacity, View } from "react-native";

import Icon from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { IconName } from "@/types/icon";
import { BudgetAllocation } from "@/types/budget-period";
import { getCurrencyMeta, showAmount } from "@/utils/currency";
import { useStore } from "@/utils/store";

type Props = {
  allocation: BudgetAllocation;
  onPress: () => void;
};

type BudgetTone = "safe" | "watch" | "over" | "idle";

function getBudgetTone(planned: number, actual: number): BudgetTone {
  if (planned === 0 && actual === 0) return "idle";
  if (planned === 0) return "over";
  const pct = actual / planned;
  if (pct > 1) return "over";
  if (pct >= 0.75) return "watch";
  return "safe";
}

function getProgressColor(tone: BudgetTone): string {
  switch (tone) {
    case "over":
      return "bg-expense";
    case "watch":
      return "bg-warning";
    case "safe":
      return "bg-income";
    default:
      return "bg-muted-foreground/30";
  }
}

function getRemainingTextColor(tone: BudgetTone): string {
  switch (tone) {
    case "over":
      return "text-expense";
    case "watch":
      return "text-warning";
    case "safe":
      return "text-income";
    default:
      return "text-foreground";
  }
}

function getStatusLabel(tone: BudgetTone): string {
  switch (tone) {
    case "over":
      return "Over budget";
    case "watch":
      return "Close to limit";
    case "safe":
      return "On track";
    default:
      return "No activity";
  }
}

function getProgressWidth(planned: number, actual: number): number {
  if (planned === 0) return actual > 0 ? 100 : 0;
  return Math.min((actual / planned) * 100, 100);
}

export default function CategoryBudgetRow({ allocation, onPress }: Props) {
  const isVisible = useStore((s) => s.isVisible);
  const baseCurrency = useStore((s) => s.baseCurrency);
  const sym = getCurrencyMeta(baseCurrency).symbol;
  const {
    planned_amount,
    actual_spend,
    remaining,
    category_name,
    category_icon,
  } = allocation;

  const tone = getBudgetTone(planned_amount, actual_spend);
  const progressColor = getProgressColor(tone);
  const progressWidth = getProgressWidth(planned_amount, actual_spend);
  const remainingTextColor = getRemainingTextColor(tone);
  const statusLabel = getStatusLabel(tone);

  return (
    <TouchableOpacity
      className="mx-5 border-b border-border/70 py-3"
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="flex-row items-start">
        <View className="mt-0.5 mr-3 h-7 w-7 rounded-full bg-muted/70 items-center justify-center">
          <Icon
            name={category_icon as IconName}
            size={14}
            className="text-muted-foreground"
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text
                className="text-sm font-semibold text-foreground"
                numberOfLines={1}
              >
                {category_name}
              </Text>
              <Text className="mt-1 text-xs text-muted-foreground">
                {showAmount(actual_spend, isVisible, sym)} of{" "}
                {showAmount(planned_amount, isVisible, sym)} spent
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Remaining
              </Text>
              <Text
                className={`mt-1 text-base font-mono font-bold ${remainingTextColor}`}
              >
                {showAmount(remaining, isVisible, sym)}
              </Text>
            </View>
          </View>

          <View className="mt-3 flex-row items-center gap-3">
            <View className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
              <View
                className={`h-full rounded-full ${progressColor}`}
                style={{ width: `${progressWidth}%` }}
              />
            </View>
            <Text className={`text-[11px] font-medium ${remainingTextColor}`}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
