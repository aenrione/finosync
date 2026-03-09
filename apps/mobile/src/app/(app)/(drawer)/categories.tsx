import { View, TouchableOpacity, RefreshControl, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback } from "react";
import { useTranslation } from "@/locale/app/drawer/categories.text";
import { useRouter } from "expo-router";

import { CategoryCard } from "@/components/features/categories/category-card";
import { useCategories } from "@/context/categories.context";
import { Category } from "@/types/category";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useStore } from "@/utils/store";
import ScreenHeader from "@/components/screen-header";
import Icon from "@/components/ui/icon";

const Categories = () => {
  const router = useRouter();
  const text = useTranslation();
  const {
    filteredCategories: categories,
    loading,
    error,
    deleteCategory,
    refreshData,
    searchTerm,
    setSearchTerm,
  } = useCategories();
  const setCategory = useStore.getState().setCurrentCategory;
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const activeCategories = categories.filter(
    (category) => category.is_active !== false,
  ).length;

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleUpdate = (item: Category) => {
    setCategory(item);
    router.push({
      pathname: "/(app)/add-category",
      params: {
        id: item.id.toString(),
        name: item.name,
        description: item.description || "",
        icon: item.icon || "Plus",
      },
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error("Failed to refresh categories:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <CategoryCard
      category={item}
      onPress={() => {}}
      onEdit={() => handleUpdate(item)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        variant="drawer"
        title={text.title}
        rightActions={[
          { icon: "Search", onPress: () => setSearchVisible(!searchVisible) },
          { icon: "Plus", onPress: () => router.push("/(app)/add-category") },
        ]}
      />

      <View className="px-5 pt-4">
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-card rounded-2xl border border-border p-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Active
            </Text>
            <Text className="text-2xl font-bold text-foreground">
              {activeCategories}
            </Text>
          </View>
          <View className="flex-1 bg-card rounded-2xl border border-border p-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Total
            </Text>
            <Text className="text-2xl font-bold text-foreground">
              {categories.length}
            </Text>
          </View>
        </View>

        {searchVisible && (
          <View className="mb-4">
            <View className="flex-row items-center bg-muted rounded-xl px-4 py-3">
              <Icon
                name="Search"
                className="text-muted-foreground mr-3"
                size={20}
              />
              <Input
                className="flex-1 border-0"
                placeholder="Search categories..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm("")}>
                  <Icon name="X" className="text-muted-foreground" size={20} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
      <View className="flex-1">
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center px-5">
            <View className="items-center">
              <Icon
                name="RefreshCw"
                className="text-muted-foreground mb-3"
                size={32}
              />
              <Text className="text-base text-muted-foreground">
                Loading categories...
              </Text>
            </View>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center px-5">
            <View className="items-center max-w-xs">
              <Icon
                name="CircleAlert"
                className="text-destructive mb-4"
                size={48}
              />
              <Text className="text-xl font-semibold text-foreground mb-2">
                Something went wrong
              </Text>
              <Text className="text-sm text-muted-foreground text-center mb-6">
                Error: {error}
              </Text>
              <TouchableOpacity
                className="flex-row items-center bg-destructive rounded-xl px-5 py-3"
                onPress={onRefresh}
              >
                <Icon
                  name="RefreshCw"
                  className="text-destructive-foreground mr-2"
                  size={16}
                />
                <Text className="text-sm font-semibold text-destructive-foreground">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : categories.length === 0 ? (
          <View className="flex-1 justify-center items-center px-5">
            <View className="items-center max-w-xs">
              <Icon
                name="Folder"
                className="text-muted-foreground mb-4"
                size={64}
              />
              <Text className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? "No categories found" : "No categories yet"}
              </Text>
              <Text className="text-sm text-muted-foreground text-center leading-5 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first category to start organizing your transactions"}
              </Text>
              {!searchTerm && (
                <TouchableOpacity
                  className="flex-row items-center bg-primary rounded-xl px-5 py-3"
                  onPress={() => router.push("/(app)/add-category")}
                >
                  <Icon
                    name="Plus"
                    className="text-primary-foreground mr-2"
                    size={16}
                  />
                  <Text className="text-sm font-semibold text-primary-foreground">
                    Create Category
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item: Category) => item.id.toString()}
            renderItem={renderCategoryItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerClassName="p-5 pb-24"
            showsVerticalScrollIndicator={false}
            numColumns={1}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Categories;
