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
