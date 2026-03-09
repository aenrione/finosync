import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";

import Icon from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { BudgetGroupSummary } from "@/types/budget-period";
import { getCurrencyMeta, showAmount } from "@/utils/currency";
import { useStore } from "@/utils/store";

import CategoryBudgetRow from "./category-budget-row";

type Props = {
  group: BudgetGroupSummary;
  onAllocationPress: (categoryId: number) => void;
};

export default function CategoryGroupSection({
  group,
  onAllocationPress,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const isVisible = useStore((s) => s.isVisible);
  const baseCurrency = useStore((s) => s.baseCurrency);
  const sym = getCurrencyMeta(baseCurrency).symbol;

  const {
    group: groupInfo,
    allocations,
    group_total_planned,
    group_total_remaining,
  } = group;

  return (
    <View className="mx-5 mb-3 overflow-hidden rounded-2xl border border-border bg-card">
      <TouchableOpacity
        className="flex-row items-center justify-between px-5 py-3"
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View className="flex-1 flex-row items-center pr-4">
          <Icon
            name={expanded ? "ChevronDown" : "ChevronRight"}
            size={16}
            className="text-muted-foreground mr-2"
          />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">
              {groupInfo.name}
            </Text>
            <Text className="mt-1 text-[11px] text-muted-foreground">
              {allocations.length}{" "}
              {allocations.length === 1 ? "category" : "categories"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="rounded-xl bg-muted px-3 py-2 items-center min-w-[92px]">
            <Text className="text-[10px] text-center uppercase tracking-wide text-muted-foreground">
              Planned
            </Text>
            <Text className="mt-1 text-center text-xs font-mono font-semibold text-foreground">
              {showAmount(group_total_planned, isVisible, sym)}
            </Text>
          </View>
          <View
            className={`min-w-[98px] items-center rounded-xl px-3 py-2 ${group_total_remaining < 0 ? "bg-expense/10" : "bg-income/10"}`}
          >
            <Text
              className={`text-[10px] text-center uppercase tracking-wide ${group_total_remaining < 0 ? "text-expense" : "text-income"}`}
            >
              Remaining
            </Text>
            <Text
              className={`mt-1 text-center text-xs font-mono font-semibold ${group_total_remaining < 0 ? "text-expense" : "text-income"}`}
            >
              {showAmount(group_total_remaining, isVisible, sym)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded &&
        allocations.map((alloc) => (
          <CategoryBudgetRow
            key={alloc.transaction_category_id}
            allocation={alloc}
            onPress={() => onAllocationPress(alloc.transaction_category_id)}
          />
        ))}
    </View>
  );
}
