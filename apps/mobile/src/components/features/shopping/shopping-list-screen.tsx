import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

import { ShoppingListCard } from "@/components/features/shopping/shopping-list-card";
import { ShoppingList } from "@/types/shopping";
import Icon from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { showAmount, getCurrencyMeta } from "@/utils/currency";
import { useStore } from "@/utils/store";

interface ShoppingListScreenProps {
  shoppingLists: ShoppingList[];
  onShoppingListPress: (shoppingList: ShoppingList) => void;
  onAddShoppingList: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  budgetRemaining?: number | null;
  budgetTotal?: number | null;
}

export default function ShoppingListScreen({
  shoppingLists,
  onShoppingListPress,
  onAddShoppingList,
  refreshing = false,
  onRefresh,
  budgetRemaining,
  budgetTotal,
}: ShoppingListScreenProps) {
  const baseCurrency = useStore((state) => state.baseCurrency);
  const currencyMeta = getCurrencyMeta(baseCurrency);
  const now = new Date();
  const activeLists = shoppingLists.filter(
    (list) => new Date(list.end_date) >= now,
  );
  const archivedLists = shoppingLists.filter(
    (list) => new Date(list.end_date) < now,
  );

  const totalPlanned = activeLists.reduce((sum, list) => sum + list.total, 0);
  const hasBudgetData =
    budgetRemaining !== null &&
    budgetRemaining !== undefined &&
    budgetTotal !== null &&
    budgetTotal !== undefined &&
    budgetTotal > 0;
  const budgetUsedByPlans = hasBudgetData
    ? Math.min((totalPlanned / budgetTotal!) * 100, 100)
    : 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      <View className="px-5 py-4">
        {/* Global budget summary banner */}
        {activeLists.length > 0 && (
          <View className="rounded-2xl bg-card border border-border p-5 mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Total planned spend
                </Text>
                <Text className="text-2xl font-bold text-foreground">
                  {showAmount(totalPlanned, true, currencyMeta.symbol)}
                </Text>
              </View>
              {hasBudgetData && (
                <View className="items-end">
                  <Text className="text-xs text-muted-foreground mb-1">
                    Monthly budget
                  </Text>
                  <Text className="text-sm font-semibold text-muted-foreground">
                    {showAmount(budgetTotal!, true, currencyMeta.symbol)}
                  </Text>
                </View>
              )}
            </View>
            {hasBudgetData && (
              <>
                <View className="h-2 bg-muted rounded-full mb-2">
                  <View
                    className={`h-2 rounded-full ${
                      totalPlanned > budgetTotal! ? "bg-expense" : "bg-primary"
                    }`}
                    style={{ width: `${budgetUsedByPlans}%` }}
                  />
                </View>
                <Text
                  className={`text-xs ${
                    totalPlanned > budgetTotal!
                      ? "text-expense"
                      : "text-muted-foreground"
                  }`}
                >
                  {totalPlanned > budgetTotal!
                    ? `${showAmount(totalPlanned - budgetTotal!, true, currencyMeta.symbol)} over your monthly budget`
                    : `${showAmount(budgetTotal! - totalPlanned, true, currencyMeta.symbol)} of monthly budget remaining`}
                </Text>
              </>
            )}
          </View>
        )}

        {shoppingLists.length === 0 ? (
          <View className="rounded-2xl bg-card border border-border p-8 items-center">
            <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
              <Icon
                name="ShoppingCart"
                className="text-muted-foreground"
                size={32}
              />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              No Shopping Lists Yet
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-4">
              Create your first list to plan a computer build, event, or any
              purchase project with a clear spending cap.
            </Text>
            <TouchableOpacity
              className="bg-primary px-6 py-3 rounded-xl flex-row items-center"
              onPress={onAddShoppingList}
            >
              <Icon name="Plus" className="text-white mr-2" size={20} />
              <Text className="text-white font-semibold">Create List</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Active lists */}
            {activeLists.length > 0 && (
              <View className="mb-5">
                <Text className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Open plans
                </Text>
                {activeLists.map((shoppingList) => (
                  <ShoppingListCard
                    key={shoppingList.id}
                    shoppingList={shoppingList}
                    onPress={() => onShoppingListPress(shoppingList)}
                  />
                ))}
              </View>
            )}

            {/* Archived lists */}
            {archivedLists.length > 0 && (
              <View>
                <Text className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Past plans
                </Text>
                {archivedLists.map((shoppingList) => (
                  <ShoppingListCard
                    key={shoppingList.id}
                    shoppingList={shoppingList}
                    onPress={() => onShoppingListPress(shoppingList)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
