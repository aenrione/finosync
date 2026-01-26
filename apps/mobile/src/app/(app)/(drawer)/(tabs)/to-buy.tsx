import { View, StyleSheet, TouchableOpacity, Text } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { useQuery } from "react-query"

import BudgetListScreen from "@/components/BudgetListScreen"
import CustomIndicator from "@/components/CustomIndicator"
import { mockBudgetLists } from "@/utils/mock/budget.mock"
import BudgetAnalytics from "@/components/BudgetAnalytics"
import { BudgetList } from "@/types/budget"
import Icon from "@/components/ui/icon"

export default function ToBuyScreen() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"list" | "analytics">("list")

  const getLists = async function (): Promise<BudgetList[]> {
    // const { data: response } = await axios.get('/api/v1/budget_lists');
    return mockBudgetLists
  }

  const { data: budgets, status, refetch, isLoading } = useQuery("budget-lists", getLists)

  const handleBudgetPress = (budget: BudgetList) => {
    // Navigate to budget detail screen
    router.push({
      pathname: "/(app)/budget/[id]",
      params: { id: budget.id.toString() }
    })
  }

  const handleAddBudget = () => {
    // Navigate to add budget screen
    router.push("/(app)/add-budget")
  }

  if (isLoading || !budgets) {
    return (
      <View className="flex-1 bg-background">
        <CustomIndicator size={150} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      {/* View Mode Toggle */}
      <View className="flex-row justify-center mb-4 mt-2 bg-b">
        <View className="bg-white rounded-xl p-1 border border-border flex-row">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg flex-row items-center ${viewMode === "list" ? "bg-primary" : "bg-transparent"}`}
            onPress={() => setViewMode("list")}
          >
            <Icon name="Menu" className={viewMode === "list" ? "text-white" : "text-muted-foreground"} size={16} />
            <Text className={`ml-2 font-medium ${viewMode === "list" ? "text-white" : "text-muted-foreground"}`}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg flex-row items-center ${viewMode === "analytics" ? "bg-primary" : "bg-transparent"}`}
            onPress={() => setViewMode("analytics")}
          >
            <Icon name="ChartPie" className={viewMode === "analytics" ? "text-white" : "text-muted-foreground"} size={16} />
            <Text className={`ml-2 font-medium ${viewMode === "analytics" ? "text-white" : "text-muted-foreground"}`}>
              Analytics
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === "list" ? (
        <BudgetListScreen
          budgets={budgets}
          onBudgetPress={handleBudgetPress}
          onAddBudget={handleAddBudget}
        />
      ) : (
        <BudgetAnalytics budgets={budgets} />
      )}
    </View>
  )
}


