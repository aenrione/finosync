import { View, TouchableOpacity } from "react-native";
import React from "react";

import { ShoppingList } from "@/types/shopping";
import Icon from "@/components/ui/icon";
import { Text as UIText } from "@/components/ui/text";
import { showAmount, getCurrencyMeta } from "@/utils/currency";
import { useStore } from "@/utils/store";

interface ShoppingListCardProps {
  shoppingList: ShoppingList;
  onPress: () => void;
}

export function ShoppingListCard({
  shoppingList,
  onPress,
}: ShoppingListCardProps) {
  const baseCurrency = useStore((state) => state.baseCurrency);
  const currencyMeta = getCurrencyMeta(baseCurrency);
  const isOverBudget = shoppingList.total > shoppingList.total_budget;
  const progress =
    shoppingList.total_budget > 0
      ? Math.min((shoppingList.total / shoppingList.total_budget) * 100, 100)
      : 0;
  const isActive = new Date(shoppingList.end_date) >= new Date();
  const purchasedCount = shoppingList.items.filter((i) => i.purchased).length;

  return (
    <TouchableOpacity
      className="rounded-xl bg-background border border-border p-4 mb-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 mr-3">
          <View
            className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
              isActive ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <Icon
              name="ShoppingCart"
              size={18}
              className={isActive ? "text-primary" : "text-muted-foreground"}
            />
          </View>
          <View className="flex-1">
            <UIText
              className="text-base font-semibold text-foreground"
              numberOfLines={1}
            >
              {shoppingList.title}
            </UIText>
            <UIText className="text-xs text-muted-foreground mt-0.5">
              {shoppingList.items.length} items
              {purchasedCount > 0 ? ` · ${purchasedCount} purchased` : ""}
            </UIText>
          </View>
        </View>

        <View className="items-end">
          <UIText
            className={`text-base font-bold ${
              isOverBudget ? "text-expense" : "text-foreground"
            }`}
          >
            {showAmount(shoppingList.total, true, currencyMeta.symbol)}
          </UIText>
          <UIText className="text-xs text-muted-foreground mt-0.5">
            of {showAmount(shoppingList.total_budget, true, currencyMeta.symbol)}
          </UIText>
        </View>
      </View>

      {/* Thin progress bar */}
      <View className="h-1.5 bg-muted rounded-full">
        <View
          className={`h-1.5 rounded-full ${
            isOverBudget ? "bg-expense" : "bg-primary"
          }`}
          style={{ width: `${progress}%` }}
        />
      </View>
    </TouchableOpacity>
  );
}
