import { View, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useState } from "react"
import { useQuery } from "react-query"

import { BudgetItemForm } from "@/components/features/to-buy/budget-item-form"
import { mockBudgetLists } from "@/utils/mock/budget.mock"
import { BudgetList, BudgetItem } from "@/types/budget"
import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"

export default function BudgetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)

  const getBudget = async (): Promise<BudgetList | null> => {
    const budgetId = parseInt(id)
    const budget = mockBudgetLists.find(b => b.id === budgetId)
    return budget || null
  }

  const { data: budget, isLoading, refetch } = useQuery(["budget", id], getBudget)

  const handleAddItem = (itemData: {
    title: string;
    description?: string;
    price: number;
    purchase_date?: string;
    purchased: boolean;
    source_href?: string;
  }) => {
    // In a real app, this would call an API to add the item
    console.log("Adding/editing item:", itemData)
    setShowAddItem(false)
    setEditingItem(null)
    refetch()
  }

  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item)
    setShowAddItem(false) // Ensure add item modal is closed
  }

  const handleDeleteItem = (itemId: number) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // In a real app, this would call an API to delete the item
            console.log("Deleting item:", itemId)
            refetch()
          }
        }
      ]
    )
  }

  const handleTogglePurchase = (item: BudgetItem) => {
    // In a real app, this would call an API to update the item
    console.log("Toggling purchase for item:", item.id)
    refetch()
  }

  if (isLoading || !budget) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted-foreground">Loading budget...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const isOverBudget = budget.total > budget.total_budget
  const remainingBudget = budget.total_budget - budget.total
  const progress = budget.total_budget > 0 ? (budget.total / budget.total_budget) * 100 : 0
  const isActive = new Date(budget.end_date) >= new Date()

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pb-3 bg-card border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground mb-1">{budget.title}</Text>
            {budget.description && (
              <Text className="text-sm text-muted-foreground">{budget.description}</Text>
            )}
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-muted items-center justify-center"
              onPress={() => {/* Edit budget */}}
            >
              <Icon name="Pencil" className="text-muted-foreground" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-red-100 items-center justify-center"
              onPress={() => {/* Delete budget */}}
            >
              <Icon name="Trash" className="text-red-600" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Budget Overview */}
        <View className="mt-5">
          <View className="bg-card rounded-2xl p-5 border border-border">
            <View className="flex-row items-center mb-4">
              <View className={`px-3 py-1 rounded-full ${isActive ? "bg-green-100" : "bg-red-100"}`}>
                <Text className={`text-xs font-semibold ${isActive ? "text-green-700" : "text-red-700"}`}>
                  {isActive ? "Active" : "Inactive"}
                </Text>
              </View>
              <View className="flex-row items-center ml-3">
                <Icon name="Calendar" className="text-muted-foreground mr-2" size={16} />
                <Text className="text-sm text-muted-foreground">
                  {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="items-center flex-1">
                <Icon name="DollarSign" className="text-blue-600 mb-1" size={20} />
                <Text className="text-xs text-muted-foreground mb-1">Budget</Text>
                <Text className="text-lg font-bold text-foreground">${budget.total_budget.toFixed(2)}</Text>
              </View>
              <View className="items-center flex-1">
                <Icon name="ShoppingCart" className="text-green-600 mb-1" size={20} />
                <Text className="text-xs text-muted-foreground mb-1">Spent</Text>
                <Text className="text-lg font-bold text-foreground">${budget.total.toFixed(2)}</Text>
              </View>
              <View className="items-center flex-1">
                {isOverBudget ? (
                  <Icon name="TrendingDown" className="text-red-600 mb-1" size={20} />
                ) : (
                  <Icon name="TrendingUp" className="text-green-600 mb-1" size={20} />
                )}
                <Text className="text-xs text-muted-foreground mb-1">Remaining</Text>
                <Text className={`text-lg font-bold ${isOverBudget ? "text-red-600" : "text-foreground"}`}>
                  ${Math.abs(remainingBudget).toFixed(2)}
                </Text>
              </View>
            </View>

            <View className="mb-3">
              <View className="h-3 bg-muted rounded-full">
                <View
                  className={`h-3 rounded-full ${isOverBudget ? "bg-red-500" : "bg-blue-500"}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </View>
              <Text className={`text-sm text-center mt-2 ${isOverBudget ? "text-red-600" : "text-muted-foreground"}`}>
                {progress.toFixed(1)}% {isOverBudget ? "over budget" : "of budget used"}
              </Text>
            </View>
          </View>
        </View>

        {/* Items Section */}
        <View className="mt-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-foreground">Budget Items</Text>
            <TouchableOpacity
              className="bg-primary px-4 py-2 rounded-xl flex-row items-center"
              onPress={() => router.push({ pathname: "/(app)/budget/[id]/add-item", params: { id: budget.id.toString() } })}
            >
              <Icon name="Plus" className="text-primary-foreground mr-2" size={20} />
              <Text className="text-primary-foreground font-semibold">Add Item</Text>
            </TouchableOpacity>
          </View>

          {budget.items.length === 0 ? (
            <View className="bg-card rounded-2xl p-8 border border-border items-center">
              <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
                <Icon name="ShoppingCart" className="text-muted-foreground" size={32} />
              </View>
              <Text className="text-lg font-semibold text-foreground mb-2">No Items Yet</Text>
              <Text className="text-sm text-muted-foreground text-center mb-4">
                Add your first item to start tracking your budget.
              </Text>
              <TouchableOpacity
                className="bg-primary px-6 py-3 rounded-xl flex-row items-center"
                onPress={() => router.push({ pathname: "/(app)/budget/[id]/add-item", params: { id: budget.id.toString() } })}
              >
                <Icon name="Plus" className="text-primary-foreground mr-2" size={20} />
                <Text className="text-primary-foreground font-semibold">Add First Item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            budget.items.map((item) => (
              <View key={item.id} className="bg-card rounded-2xl p-4 mb-3 border border-border">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground mb-1">{item.title}</Text>
                    {item.description && (
                      <Text className="text-sm text-muted-foreground mb-2">{item.description}</Text>
                    )}
                    <Text className="text-lg font-bold text-foreground">${item.price.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="w-8 h-8 rounded-full bg-muted items-center justify-center"
                      onPress={() => handleEditItem(item)}
                    >
                      <Icon name="Pencil" className="text-muted-foreground" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-8 h-8 rounded-full bg-red-100 items-center justify-center"
                      onPress={() => handleDeleteItem(item.id)}
                    >
                      <Icon name="Trash" className="text-red-600" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-lg ${item.purchased ? "bg-green-100" : "bg-muted"}`}
                    onPress={() => handleTogglePurchase(item)}
                  >
                    <Text className={`font-medium ${item.purchased ? "text-green-700" : "text-muted-foreground"}`}>
                      {item.purchased ? "Purchased" : "Not Purchased"}
                    </Text>
                  </TouchableOpacity>
                  {item.purchase_date && (
                    <Text className="text-sm text-muted-foreground">
                      {new Date(item.purchase_date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit Item Modal (optional, can keep as modal for now) */}
      {editingItem && (
        <BudgetItemForm
          onSave={handleAddItem}
          onCancel={() => setEditingItem(null)}
          initialData={editingItem}
        />
      )}
    </SafeAreaView>
  )
}
