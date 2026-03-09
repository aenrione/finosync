import { View, TouchableOpacity } from "react-native";
import React from "react";

import { ShoppingList } from "@/types/shopping";
import Icon from "@/components/ui/icon";
import { Text as UIText } from "@/components/ui/text";

interface ShoppingListCardProps {
  shoppingList: ShoppingList;
  onPress: () => void;
}

export function ShoppingListCard({
  shoppingList,
  onPress,
}: ShoppingListCardProps) {
  const isOverBudget = shoppingList.total > shoppingList.total_budget;
  const remainingBudget = shoppingList.total_budget - shoppingList.total;
  const progress =
    shoppingList.total_budget > 0
      ? (shoppingList.total / shoppingList.total_budget) * 100
      : 0;
  const isActive = new Date(shoppingList.end_date) >= new Date();

  return (
    <TouchableOpacity
      className="bg-card rounded-2xl p-5 mb-4 border border-border"
      onPress={onPress}
    >
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <UIText className="text-xl font-bold text-foreground flex-1">
            {shoppingList.title}
          </UIText>
          <View
            className={`px-3 py-1 rounded-full ${isActive ? "bg-primary/10" : "bg-expense/10"}`}
          >
            <UIText
              className={`text-xs font-semibold uppercase ${isActive ? "text-primary" : "text-expense"}`}
            >
              {isActive ? "Active" : "Inactive"}
            </UIText>
          </View>
        </View>
        {shoppingList.description && (
          <UIText className="text-sm text-muted-foreground leading-5">
            {shoppingList.description}
          </UIText>
        )}
      </View>

      <View className="flex-row items-center mb-4">
        <Icon
          name="Calendar"
          className="text-muted-foreground mr-2"
          size={16}
        />
        <UIText className="text-sm text-muted-foreground">
          {new Date(shoppingList.start_date).toLocaleDateString()} -{" "}
          {new Date(shoppingList.end_date).toLocaleDateString()}
        </UIText>
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="items-center flex-1">
          <Icon name="Wallet" className="text-primary mb-1" size={20} />
          <UIText className="text-xs text-muted-foreground mb-1">Cap</UIText>
          <UIText className="text-base font-bold text-foreground">
            ${shoppingList.total_budget.toFixed(2)}
          </UIText>
        </View>
        <View className="items-center flex-1">
          <Icon name="TrendingDown" className="text-expense mb-1" size={20} />
          <UIText className="text-xs text-muted-foreground mb-1">
            Planned
          </UIText>
          <UIText className="text-base font-bold text-foreground">
            ${shoppingList.total.toFixed(2)}
          </UIText>
        </View>
        <View className="items-center flex-1">
          {isOverBudget ? (
            <Icon name="TrendingDown" className="text-expense mb-1" size={20} />
          ) : (
            <Icon name="TrendingUp" className="text-primary mb-1" size={20} />
          )}
          <UIText className="text-xs text-muted-foreground mb-1">
            Remaining
          </UIText>
          <UIText
            className={`text-base font-bold ${isOverBudget ? "text-expense" : "text-primary"}`}
          >
            ${Math.abs(remainingBudget).toFixed(2)}
          </UIText>
        </View>
      </View>

      <View className="mb-3">
        <View className="h-2 bg-muted rounded-full">
          <View
            className={`h-2 rounded-full ${isOverBudget ? "bg-expense" : "bg-primary"}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </View>
        <UIText
          className={`text-sm text-center mt-2 ${isOverBudget ? "text-expense" : "text-muted-foreground"}`}
        >
          {progress.toFixed(1)}% {isOverBudget ? "over cap" : "of cap used"}
        </UIText>
      </View>

      <View className="border-t border-border pt-3">
        <UIText className="text-sm text-muted-foreground text-center">
          {shoppingList.items.length} items •{" "}
          {shoppingList.items.filter((item) => item.purchased).length} purchased
        </UIText>
      </View>
    </TouchableOpacity>
  );
}
