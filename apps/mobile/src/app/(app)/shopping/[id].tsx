import React from "react";
import {
  Alert,
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

export default function ShoppingListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [linkingItem, setLinkingItem] = React.useState<ShoppingItem | null>(
    null,
  );

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
      ? (shoppingList.total / shoppingList.total_budget) * 100
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
        <View className="px-5 py-5 gap-4">
          {shoppingList.budget_allocation ? (
            <View className="bg-card rounded-2xl border border-border p-5">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground mb-2">
                Linked Budget Allocation
              </Text>
              <Text className="text-lg font-semibold text-foreground">
                {shoppingList.budget_allocation.category_name}
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                {`${shoppingList.budget_allocation.budget_period_month}/${shoppingList.budget_allocation.budget_period_year} - Planned $${shoppingList.budget_allocation.planned_amount.toFixed(2)}`}
              </Text>
            </View>
          ) : null}

          <View className="bg-card rounded-2xl border border-border p-5">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground mb-2">
                  List health
                </Text>
                <Text className="text-3xl font-bold text-foreground">
                  ${shoppingList.total_budget.toFixed(2)}
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  {new Date(shoppingList.start_date).toLocaleDateString()} -{" "}
                  {new Date(shoppingList.end_date).toLocaleDateString()}
                </Text>
              </View>
              <View
                className={`px-3 py-2 rounded-full ${isOverBudget ? "bg-expense/10" : "bg-primary/10"}`}
              >
                <Text
                  className={`text-xs font-semibold uppercase ${isOverBudget ? "text-expense" : "text-primary"}`}
                >
                  {isOverBudget ? "Over cap" : "On plan"}
                </Text>
              </View>
            </View>

            <View className="h-3 bg-muted rounded-full overflow-hidden mb-3">
              <View
                className={`h-full ${isOverBudget ? "bg-expense" : "bg-primary"}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 rounded-2xl bg-background border border-border p-4">
                <Text className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Spent
                </Text>
                <Text className="text-xl font-bold text-foreground">
                  ${shoppingList.total.toFixed(2)}
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-background border border-border p-4">
                <Text className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Remaining
                </Text>
                <Text
                  className={`text-xl font-bold ${remainingBudget >= 0 ? "text-primary" : "text-expense"}`}
                >
                  ${Math.abs(remainingBudget).toFixed(2)}
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-background border border-border p-4">
                <Text className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Items
                </Text>
                <Text className="text-xl font-bold text-foreground">
                  {purchasedCount}/{shoppingList.items.length}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-card rounded-2xl border border-border p-5">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-xl font-semibold text-foreground">
                  Shopping Items
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Purchased items stay visible so the list keeps its full plan
                  context.
                </Text>
              </View>
            </View>

            {shoppingList.items.length === 0 ? (
              <View className="rounded-2xl border border-dashed border-border px-5 py-10 items-center bg-background">
                <Icon
                  name="ReceiptText"
                  className="text-muted-foreground mb-3"
                  size={28}
                />
                <Text className="text-base font-semibold text-foreground mb-1">
                  No items yet
                </Text>
                <Text className="text-sm text-muted-foreground text-center mb-4">
                  Add planned purchases so this shopping list can track what
                  still matters.
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
              <View className="gap-3">
                {shoppingList.items.map((item) => (
                  <View
                    key={item.id}
                    className="rounded-2xl border border-border bg-background p-4"
                  >
                    <View className="flex-row items-start justify-between mb-3 gap-3">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground mb-1">
                          {item.title}
                        </Text>
                        {item.description ? (
                          <Text className="text-sm text-muted-foreground mb-2">
                            {item.description}
                          </Text>
                        ) : null}
                        <Text className="text-lg font-bold text-foreground">
                          ${item.price.toFixed(2)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        className="w-9 h-9 rounded-full items-center justify-center bg-expense/10"
                        onPress={() => handleDeleteItem(item.id)}
                      >
                        <Icon
                          name="Trash2"
                          className="text-expense"
                          size={16}
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View
                        className={`px-3 py-2 rounded-full ${item.purchased ? "bg-primary/10" : "bg-muted"}`}
                      >
                        <Text
                          className={`text-xs font-semibold uppercase ${item.purchased ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {item.purchased ? "Purchased" : "Planned"}
                        </Text>
                      </View>
                      <Text className="text-sm text-muted-foreground">
                        {item.purchase_date
                          ? new Date(item.purchase_date).toLocaleDateString()
                          : "No date set"}
                      </Text>
                    </View>

                    {item.transaction ? (
                      <View className="mt-4 rounded-2xl border border-border bg-card p-4">
                        <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground mb-2">
                          Linked Transaction
                        </Text>
                        <Text className="text-sm font-semibold text-foreground">
                          {item.transaction.description}
                        </Text>
                        <Text className="text-sm text-muted-foreground mt-1">
                          {item.transaction.formatted_amount ||
                            `$${Math.abs(item.transaction.amount).toFixed(2)}`}
                          {" · "}
                          {new Date(
                            item.transaction.transaction_date,
                          ).toLocaleDateString()}
                        </Text>
                        <TouchableOpacity
                          className="mt-3 self-start rounded-xl bg-expense/10 px-4 py-2"
                          onPress={() => handleUnlinkTransaction(item)}
                          disabled={linkTransactionMutation.isLoading}
                        >
                          <Text className="font-semibold text-expense">
                            Unlink transaction
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        className="mt-4 rounded-xl bg-primary px-4 py-3 items-center"
                        onPress={() => setLinkingItem(item)}
                        disabled={linkTransactionMutation.isLoading}
                      >
                        <Text className="font-semibold text-primary-foreground">
                          Link transaction to mark purchased
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
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
