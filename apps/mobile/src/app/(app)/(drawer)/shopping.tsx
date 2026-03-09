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
import { fetchBudgetSummary } from "@/services/budget-period.service";
import { fetchShoppingLists } from "@/services/shopping.service";
import { ShoppingList } from "@/types/shopping";
import { useStore } from "@/utils/store";

export default function ShoppingDrawerScreen() {
  const router = useRouter();
  const baseCurrency = useStore((state) => state.baseCurrency);
  const today = new Date();

  const { data: budgetSummary } = useQuery(
    ["budget-summary", today.getFullYear(), today.getMonth() + 1, baseCurrency],
    () =>
      fetchBudgetSummary(
        today.getFullYear(),
        today.getMonth() + 1,
        baseCurrency,
      ),
  );

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
        budgetRemaining={budgetSummary?.left_to_budget ?? null}
        budgetTotal={budgetSummary?.total_income ?? null}
      />
    </SafeAreaView>
  );
}
