# Shopping Screens Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the shopping list and detail screens to be more compact, scannable, and aligned with the dashboard's visual language — prioritizing the planning/research use case over purchase tracking.

**Architecture:** Replace the tall, info-dense shopping list cards with compact row-style cards. Add a global budget summary banner at the top of the main screen. Redesign the detail screen with expandable compact rows instead of bulky item cards. All styling follows existing dashboard patterns (rounded-2xl cards, bg-card/bg-background tokens, border-border, same text hierarchy).

**Tech Stack:** React Native, Expo Router, NativeWind (Tailwind), Gluestack UI components, React Query, existing `formatCurrency`/`showAmount` utilities from `@/utils/currency`.

---

## Key Files Reference

| Purpose | Path |
|---------|------|
| Shopping main screen (drawer tab) | `apps/mobile/src/app/(app)/(drawer)/shopping.tsx` |
| Shopping list presentational screen | `apps/mobile/src/components/features/shopping/shopping-list-screen.tsx` |
| Shopping list card component | `apps/mobile/src/components/features/shopping/shopping-list-card.tsx` |
| Shopping detail screen | `apps/mobile/src/app/(app)/shopping/[id].tsx` |
| Shopping item form modal | `apps/mobile/src/components/features/shopping/shopping-item-form.tsx` |
| Shopping types | `apps/mobile/src/types/shopping.ts` |
| Shopping service | `apps/mobile/src/services/shopping.service.ts` |
| Currency utilities | `apps/mobile/src/utils/currency.ts` |
| Color tokens (raw) | `apps/mobile/src/lib/colors.ts` |
| Screen header | `apps/mobile/src/components/screen-header.tsx` |
| Budget context (available in tabs) | `apps/mobile/src/context/budget.tsx` |
| Budget service | `apps/mobile/src/services/budget-period.service.ts` |

### Design Patterns to Follow (from dashboard)

- **Section card**: `className="rounded-2xl bg-card border border-border p-5"`
- **Inner item row**: `className="rounded-xl bg-background border border-border p-3"` or `p-4`
- **Progress bar**: Outer `h-2 rounded-full bg-muted`, inner with dynamic width and semantic color
- **Text hierarchy**: Title `text-base font-semibold text-foreground`, value `text-lg font-bold text-foreground`, label `text-xs text-muted-foreground`, small `text-sm text-muted-foreground`
- **Semantic colors**: Positive/under-budget uses `text-primary` or `text-income`, over-budget uses `text-expense`
- **Status badges**: `px-3 py-1 rounded-full bg-primary/10 text-primary` or `bg-expense/10 text-expense`
- **Expandable rows**: `useState<Set<number>>` with `{isExpanded && (...)}` conditional rendering

---

## Task 1: Redesign the Shopping List Card (Compact Row)

**Files:**
- Modify: `apps/mobile/src/components/features/shopping/shopping-list-card.tsx`

**Step 1: Replace the card with a compact row layout**

Replace the entire contents of `shopping-list-card.tsx`:

```tsx
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
```

**Step 2: Verify it renders correctly**

Run: `cd apps/mobile && pnpm start` (already running), then navigate to `/shopping` in the browser.

**Step 3: Commit**

```bash
git add apps/mobile/src/components/features/shopping/shopping-list-card.tsx
git commit -m "feat(shopping): redesign list card as compact row with progress bar"
```

---

## Task 2: Add Global Budget Summary Banner to Main Screen

**Files:**
- Modify: `apps/mobile/src/components/features/shopping/shopping-list-screen.tsx`
- Modify: `apps/mobile/src/app/(app)/(drawer)/shopping.tsx`

**Step 1: Update the shopping drawer screen to pass budget data**

The shopping screen lives inside the `(drawer)/(tabs)` layout which wraps `BudgetProvider`, so `useBudget()` is available.

Modify `apps/mobile/src/app/(app)/(drawer)/shopping.tsx` to pass budget summary data as a prop:

```tsx
import React from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "react-query";

import ShoppingListScreen from "@/components/features/shopping/shopping-list-screen";
import ScreenHeader from "@/components/screen-header";
import Icon from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useBudget } from "@/context/budget";
import { fetchShoppingLists } from "@/services/shopping.service";
import { ShoppingList } from "@/types/shopping";

export default function ShoppingDrawerScreen() {
  const router = useRouter();
  const { summary } = useBudget();

  const {
    data: shoppingLists,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery<ShoppingList[]>(["shopping-lists"], fetchShoppingLists);

  const handleOpenList = (shoppingList: ShoppingList) => {
    router.push({
      pathname: "/(app)/shopping/[id]",
      params: { id: shoppingList.id.toString() },
    });
  };

  const handleCreateList = () => {
    router.push("/(app)/add-shopping-list");
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Spinner size="large" />
        <Text className="mt-4 text-muted-foreground">
          Loading shopping lists...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader
          variant="drawer"
          title="Shopping Lists"
          rightActions={[{ icon: "Plus", onPress: handleCreateList }]}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Failed to load shopping lists."}
          </Text>
          <TouchableOpacity
            className="mt-4 bg-primary rounded-xl px-6 py-3 flex-row items-center"
            onPress={() => {
              refetch().catch(() => {
                Alert.alert("Error", "Could not refresh shopping lists.");
              });
            }}
          >
            <Icon name="RefreshCcw" className="text-primary-foreground mr-2" />
            <Text className="text-primary-foreground font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        variant="drawer"
        title="Shopping Lists"
        rightActions={[{ icon: "Plus", onPress: handleCreateList }]}
      />
      <ShoppingListScreen
        shoppingLists={shoppingLists ?? []}
        onShoppingListPress={handleOpenList}
        onAddShoppingList={handleCreateList}
        refreshing={isRefetching}
        onRefresh={() => {
          refetch();
        }}
        budgetRemaining={summary?.total_remaining ?? null}
        budgetTotal={summary?.total_budgeted ?? null}
      />
    </SafeAreaView>
  );
}
```

**Step 2: Redesign the shopping list screen with budget banner**

Replace the contents of `apps/mobile/src/components/features/shopping/shopping-list-screen.tsx`:

```tsx
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
```

**Step 3: Verify visually**

Navigate to `/shopping` in the browser. You should see:
- A budget summary banner at the top with "Total planned spend" and a progress bar
- Compact list cards below with icon, title, item count, amount, and thin progress bar
- Section headers "OPEN PLANS" and "PAST PLANS" in small uppercase

**Step 4: Commit**

```bash
git add apps/mobile/src/components/features/shopping/shopping-list-screen.tsx apps/mobile/src/app/\(app\)/\(drawer\)/shopping.tsx
git commit -m "feat(shopping): add global budget banner and compact list layout"
```

---

## Task 3: Redesign the Shopping Detail Screen with Expandable Rows

**Files:**
- Modify: `apps/mobile/src/app/(app)/shopping/[id].tsx`

**Step 1: Rewrite the detail screen with compact summary and expandable item rows**

Replace the contents of `apps/mobile/src/app/(app)/shopping/[id].tsx`:

```tsx
import React, { useState } from "react";
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { ShoppingTransactionPicker } from "@/components/features/shopping/shopping-transaction-picker";
import ScreenHeader from "@/components/screen-header";
import Icon from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  deleteShoppingItem,
  fetchShoppingList,
  updateShoppingItem,
} from "@/services/shopping.service";
import { ShoppingItem } from "@/types/shopping";
import { showAmount, getCurrencyMeta } from "@/utils/currency";
import { useStore } from "@/utils/store";

export default function ShoppingListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const baseCurrency = useStore((state) => state.baseCurrency);
  const currencyMeta = getCurrencyMeta(baseCurrency);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [linkingItem, setLinkingItem] = useState<ShoppingItem | null>(null);

  const toggleExpanded = (itemId: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const {
    data: shoppingList,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(["shopping-list", id], () => fetchShoppingList(id));

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => deleteShoppingItem(id, itemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries(["shopping-list", id]);
      await queryClient.invalidateQueries(["shopping-lists"]);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not delete the item.",
      );
    },
  });

  const linkTransactionMutation = useMutation({
    mutationFn: ({
      itemId,
      transactionId,
    }: {
      itemId: number;
      transactionId: number | null;
    }) => updateShoppingItem(id, itemId, { transaction_id: transactionId }),
    onSuccess: async () => {
      setLinkingItem(null);
      await queryClient.invalidateQueries(["shopping-list", id]);
      await queryClient.invalidateQueries(["shopping-lists"]);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Could not update the shopping item.",
      );
    },
  });

  const handleDeleteItem = (itemId: number) => {
    Alert.alert("Delete Item", "Remove this item from the shopping list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteItemMutation.mutate(itemId),
      },
    ]);
  };

  const handleUnlinkTransaction = (item: ShoppingItem) => {
    Alert.alert(
      "Unlink Transaction",
      "This will mark the item as planned again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: () =>
            linkTransactionMutation.mutate({
              itemId: item.id,
              transactionId: null,
            }),
        },
      ],
    );
  };

  if (isLoading || !shoppingList) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Spinner size="large" />
        <Text className="mt-4 text-muted-foreground">
          Loading shopping list...
        </Text>
      </SafeAreaView>
    );
  }

  const isOverBudget = shoppingList.total > shoppingList.total_budget;
  const remainingBudget = shoppingList.total_budget - shoppingList.total;
  const progress =
    shoppingList.total_budget > 0
      ? Math.min(
          (shoppingList.total / shoppingList.total_budget) * 100,
          100,
        )
      : 0;
  const purchasedCount = shoppingList.items.filter(
    (item) => item.purchased,
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        variant="back"
        title={shoppingList.title}
        rightActions={[
          {
            icon: "Plus",
            onPress: () =>
              router.push({
                pathname: "/(app)/shopping/[id]/add-item",
                params: { id },
              }),
          },
        ]}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View className="px-5 py-4 gap-4">
          {/* Compact summary strip */}
          <View className="rounded-2xl bg-card border border-border p-5">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Planned spend
                </Text>
                <Text className="text-2xl font-bold text-foreground">
                  {showAmount(shoppingList.total, true, currencyMeta.symbol)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-muted-foreground mb-1">Cap</Text>
                <Text className="text-base font-semibold text-muted-foreground">
                  {showAmount(
                    shoppingList.total_budget,
                    true,
                    currencyMeta.symbol,
                  )}
                </Text>
              </View>
            </View>

            <View className="h-2 bg-muted rounded-full mb-3">
              <View
                className={`h-2 rounded-full ${
                  isOverBudget ? "bg-expense" : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              />
            </View>

            <View className="flex-row justify-between">
              <Text
                className={`text-xs ${
                  isOverBudget ? "text-expense" : "text-muted-foreground"
                }`}
              >
                {isOverBudget
                  ? `${showAmount(Math.abs(remainingBudget), true, currencyMeta.symbol)} over cap`
                  : `${showAmount(remainingBudget, true, currencyMeta.symbol)} remaining`}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {purchasedCount}/{shoppingList.items.length} purchased
              </Text>
            </View>

            {shoppingList.budget_allocation && (
              <View className="mt-3 pt-3 border-t border-border flex-row items-center">
                <Icon
                  name="Link"
                  size={14}
                  className="text-muted-foreground mr-2"
                />
                <Text className="text-xs text-muted-foreground">
                  Linked to{" "}
                  <Text className="text-xs font-semibold text-foreground">
                    {shoppingList.budget_allocation.category_name}
                  </Text>
                  {" budget"}
                </Text>
              </View>
            )}
          </View>

          {/* Items section */}
          <View>
            <Text className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Items
            </Text>

            {shoppingList.items.length === 0 ? (
              <View className="rounded-2xl border border-dashed border-border px-5 py-10 items-center bg-card">
                <Icon
                  name="ReceiptText"
                  className="text-muted-foreground mb-3"
                  size={28}
                />
                <Text className="text-base font-semibold text-foreground mb-1">
                  No items yet
                </Text>
                <Text className="text-sm text-muted-foreground text-center mb-4">
                  Add planned purchases to track what you need.
                </Text>
                <TouchableOpacity
                  className="bg-primary rounded-xl px-5 py-3 flex-row items-center"
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/shopping/[id]/add-item",
                      params: { id },
                    })
                  }
                >
                  <Icon
                    name="Plus"
                    className="text-primary-foreground mr-2"
                    size={18}
                  />
                  <Text className="text-primary-foreground font-semibold">
                    Add Item
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="rounded-2xl bg-card border border-border overflow-hidden">
                {shoppingList.items.map((item, index) => {
                  const isExpanded = expandedItems.has(item.id);
                  const isLast = index === shoppingList.items.length - 1;

                  return (
                    <View key={item.id}>
                      {/* Compact row */}
                      <TouchableOpacity
                        className={`flex-row items-center px-4 py-3.5 ${
                          !isLast && !isExpanded ? "border-b border-border" : ""
                        }`}
                        onPress={() => toggleExpanded(item.id)}
                        activeOpacity={0.7}
                      >
                        {/* Status indicator */}
                        <View
                          className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                            item.purchased
                              ? "bg-primary"
                              : "border-2 border-border"
                          }`}
                        >
                          {item.purchased && (
                            <Icon
                              name="Check"
                              size={14}
                              className="text-white"
                            />
                          )}
                        </View>

                        {/* Title */}
                        <Text
                          className={`flex-1 text-sm font-medium ${
                            item.purchased
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>

                        {/* Price */}
                        <Text className="text-sm font-semibold text-foreground ml-3">
                          {showAmount(item.price, true, currencyMeta.symbol)}
                        </Text>

                        {/* Expand chevron */}
                        <Icon
                          name={isExpanded ? "ChevronUp" : "ChevronDown"}
                          size={16}
                          className="text-muted-foreground ml-2"
                        />
                      </TouchableOpacity>

                      {/* Expanded details */}
                      {isExpanded && (
                        <View
                          className={`px-4 pb-4 bg-background ${
                            !isLast ? "border-b border-border" : ""
                          }`}
                        >
                          <View className="pl-9 gap-3">
                            {item.description && (
                              <Text className="text-sm text-muted-foreground">
                                {item.description}
                              </Text>
                            )}

                            {item.purchase_date && (
                              <View className="flex-row items-center">
                                <Icon
                                  name="Calendar"
                                  size={14}
                                  className="text-muted-foreground mr-2"
                                />
                                <Text className="text-xs text-muted-foreground">
                                  {new Date(
                                    item.purchase_date,
                                  ).toLocaleDateString()}
                                </Text>
                              </View>
                            )}

                            {item.source_href && (
                              <TouchableOpacity
                                className="flex-row items-center"
                                onPress={() =>
                                  Linking.openURL(item.source_href!)
                                }
                              >
                                <Icon
                                  name="ExternalLink"
                                  size={14}
                                  className="text-primary mr-2"
                                />
                                <Text
                                  className="text-xs text-primary"
                                  numberOfLines={1}
                                >
                                  {item.source_href}
                                </Text>
                              </TouchableOpacity>
                            )}

                            {/* Linked transaction */}
                            {item.transaction ? (
                              <View className="rounded-xl bg-card border border-border p-3">
                                <View className="flex-row items-center justify-between">
                                  <View className="flex-1">
                                    <Text className="text-xs text-muted-foreground mb-0.5">
                                      Linked transaction
                                    </Text>
                                    <Text
                                      className="text-sm font-medium text-foreground"
                                      numberOfLines={1}
                                    >
                                      {item.transaction.description}
                                    </Text>
                                  </View>
                                  <TouchableOpacity
                                    className="ml-3"
                                    onPress={() =>
                                      handleUnlinkTransaction(item)
                                    }
                                    disabled={
                                      linkTransactionMutation.isLoading
                                    }
                                    hitSlop={8}
                                  >
                                    <Icon
                                      name="Unlink"
                                      size={16}
                                      className="text-expense"
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            ) : (
                              <TouchableOpacity
                                className="flex-row items-center"
                                onPress={() => setLinkingItem(item)}
                                disabled={linkTransactionMutation.isLoading}
                              >
                                <Icon
                                  name="Link"
                                  size={14}
                                  className="text-primary mr-2"
                                />
                                <Text className="text-xs font-medium text-primary">
                                  Link transaction
                                </Text>
                              </TouchableOpacity>
                            )}

                            {/* Delete */}
                            <TouchableOpacity
                              className="flex-row items-center"
                              onPress={() => handleDeleteItem(item.id)}
                            >
                              <Icon
                                name="Trash2"
                                size={14}
                                className="text-expense mr-2"
                              />
                              <Text className="text-xs font-medium text-expense">
                                Remove item
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <ShoppingTransactionPicker
        visible={linkingItem !== null}
        item={linkingItem}
        onClose={() => setLinkingItem(null)}
        onSelect={(transaction) => {
          if (!linkingItem) return;

          linkTransactionMutation.mutate({
            itemId: linkingItem.id,
            transactionId: transaction.id,
          });
        }}
      />
    </SafeAreaView>
  );
}
```

**Step 2: Verify visually**

Navigate to `/shopping/2` in the browser. You should see:
- A compact summary card at the top with "Planned spend" hero number, cap, progress bar, remaining/items count
- Budget allocation shown as a small linked chip
- Items displayed as compact rows: circle indicator + title + price + chevron
- Tapping an item expands it to show description, date, source URL, link transaction, and delete actions

**Step 3: Commit**

```bash
git add apps/mobile/src/app/\(app\)/shopping/\[id\].tsx
git commit -m "feat(shopping): redesign detail screen with compact expandable item rows"
```

---

## Task 4: Remove the SafeAreaView Wrapper from shopping-list-screen

The parent `shopping.tsx` already wraps in `SafeAreaView`, and the presentational component had its own. The new version in Task 2 removed it by using plain `ScrollView` at the root. No action needed — already handled.

---

## Task 5: Visual QA and Polish

**Step 1: Check both screens end-to-end**

1. Navigate to `/shopping` — verify budget banner, compact cards, section headers
2. Tap a list — verify detail screen loads with compact summary and item rows
3. Expand an item — verify description, date, URL, link/unlink, delete all show
4. Tap "+" to add an item — verify the add-item modal still works
5. Pull to refresh on both screens — verify data reloads

**Step 2: Check empty states**

If possible, test with a list that has no items to verify the empty state renders properly.

**Step 3: Final commit if any polish needed**

```bash
git add -u
git commit -m "fix(shopping): visual polish after QA"
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `shopping-list-card.tsx` | Replaced tall card with compact row (icon + title + amount + thin progress bar) |
| `shopping-list-screen.tsx` | Added global budget banner, compact section headers, removed SafeAreaView wrapper |
| `shopping.tsx` (drawer) | Added `useBudget()` hook, passes budget data to screen component |
| `shopping/[id].tsx` | Compact summary strip, expandable item rows with expand/collapse, secondary actions behind tap |

**No backend changes needed.** All data is already available from existing API endpoints.
