import { 
  Plus, 
  Search, 
  RefreshCw, 
  CircleAlert as AlertCircle, 
  Folder, 
  X
} from "lucide-react-native"
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import React, { useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "expo-router"

import { CategoryCard } from "@/components/screens/categories/category-card"
import { useCategories } from "@/context/categories.context"
import { Category } from "@/types/category"
import { useStore } from "@/utils/store"

const Categories = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { 
    filteredCategories: categories, 
    loading, 
    error, 
    deleteCategory, 
    refreshData,
    searchTerm,
    setSearchTerm
  } = useCategories()
  const setCategory = useStore.getState().setCurrentCategory
  const [refreshing, setRefreshing] = useState(false)
  const [searchVisible, setSearchVisible] = useState(false)

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id)
    } catch (error) {
      console.error("Failed to delete category:", error)
    }
  }

  const handleUpdate = (item: Category) => {
    setCategory(item)
    router.push({
      pathname: "/(app)/add-category",
      params: {
        id: item.id.toString(),
        name: item.name,
        description: item.description || "",
        icon: item.icon || "Plus"
      }
    })
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refreshData()
    } catch (error) {
      console.error("Failed to refresh categories:", error)
    } finally {
      setRefreshing(false)
    }
  }, [refreshData])

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <CategoryCard
      category={item}
      onPress={() => {}}
      onEdit={() => handleUpdate(item)}
      onDelete={() => handleDelete(item.id)}
    />
  )

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="bg-white px-5 pb-4 border-b border-border">
        <View className="flex-row justify-between items-start pt-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground mb-1">
              {t("navigation.categories")}
            </Text>
            <Text className="text-base text-muted-foreground">
              Manage your spending categories
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-muted justify-center items-center"
              onPress={onRefresh}
            >
              <RefreshCw size={20} className="text-muted-foreground" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-muted justify-center items-center"
              onPress={() => setSearchVisible(!searchVisible)}
            >
              <Search size={20} className="text-muted-foreground" />
            </TouchableOpacity>
          </View>
        </View>
        {searchVisible && (
          <View className="mb-4">
            <View className="flex-row items-center bg-muted rounded-xl px-4 py-3">
              <Search size={20} className="text-muted-foreground mr-3" />
              <TextInput
                className="flex-1 text-foreground text-base"
                placeholder="Search categories..."
                placeholderTextColor="#9CA3AF"
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm("")}>
                  <X size={20} className="text-muted-foreground" />
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
              <RefreshCw size={32} className="text-muted-foreground mb-3" />
              <Text className="text-base text-muted-foreground">Loading categories...</Text>
            </View>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center px-5">
            <View className="items-center max-w-xs">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <Text className="text-xl font-semibold text-foreground mb-2">Something went wrong</Text>
              <Text className="text-sm text-muted-foreground text-center mb-6">Error: {error}</Text>
              <TouchableOpacity 
                className="flex-row items-center bg-red-500 rounded-xl px-5 py-3"
                onPress={onRefresh}
              >
                <RefreshCw size={16} className="text-white mr-2" />
                <Text className="text-sm font-semibold text-white">Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : categories.length === 0 ? (
          <View className="flex-1 justify-center items-center px-5">
            <View className="items-center max-w-xs">
              <Folder size={64} className="text-muted-foreground mb-4" />
              <Text className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? "No categories found" : "No categories yet"}
              </Text>
              <Text className="text-sm text-muted-foreground text-center leading-5 mb-6">
                {searchTerm 
                  ? "Try adjusting your search terms"
                  : "Create your first category to start organizing your transactions"
                }
              </Text>
              {!searchTerm && (
                <TouchableOpacity
                  className="flex-row items-center bg-primary rounded-xl px-5 py-3"
                  onPress={() => router.push("/(app)/add-category")}
                >
                  <Plus size={16} className="text-white mr-2" />
                  <Text className="text-sm font-semibold text-white">Create Category</Text>
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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6B7280"
                colors={["#6B7280"]}
              />
            }
            contentContainerStyle={{ 
              padding: 20, 
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
            numColumns={1}
          />
        )}
      </View>
      <TouchableOpacity
        className="absolute bottom-8 right-5 w-14 h-14 rounded-full bg-primary justify-center items-center shadow-lg"
        onPress={() => router.push("/(app)/add-category")}
        activeOpacity={0.8}
      >
        <Plus size={24} className="text-white" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Categories