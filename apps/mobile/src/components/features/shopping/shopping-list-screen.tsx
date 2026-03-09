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

interface ShoppingListScreenProps {
  shoppingLists: ShoppingList[];
  onShoppingListPress: (shoppingList: ShoppingList) => void;
  onAddShoppingList: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ShoppingListScreen({
  shoppingLists,
  onShoppingListPress,
  onAddShoppingList,
  refreshing = false,
  onRefresh,
}: ShoppingListScreenProps) {
  const now = new Date();
  const activeLists = shoppingLists.filter(
    (list) => new Date(list.end_date) >= now,
  );
  const archivedLists = shoppingLists.filter(
    (list) => new Date(list.end_date) < now,
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        <View className="mb-8">
          {shoppingLists.length === 0 ? (
            <View className="bg-card rounded-2xl p-8 border border-border items-center">
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
              <View className="mt-4 mb-4">
                <Text className="text-xl font-semibold text-foreground">
                  Open plans
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  The lists you are still actively pricing, tracking, or buying.
                </Text>
              </View>

              {activeLists.length > 0 ? (
                activeLists.map((shoppingList) => (
                  <ShoppingListCard
                    key={shoppingList.id}
                    shoppingList={shoppingList}
                    onPress={() => onShoppingListPress(shoppingList)}
                  />
                ))
              ) : (
                <View className="rounded-2xl border border-dashed border-border px-5 py-6 mb-6 bg-card">
                  <Text className="text-base font-semibold text-foreground">
                    No open plans right now
                  </Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    Start a new list when you want to map out a new purchase.
                  </Text>
                </View>
              )}

              {archivedLists.length > 0 ? (
                <View className="mt-2">
                  <View className="mb-4">
                    <Text className="text-xl font-semibold text-foreground">
                      Past plans
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                      Finished or expired lists kept for reference.
                    </Text>
                  </View>

                  {archivedLists.map((shoppingList) => (
                    <ShoppingListCard
                      key={shoppingList.id}
                      shoppingList={shoppingList}
                      onPress={() => onShoppingListPress(shoppingList)}
                    />
                  ))}
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
