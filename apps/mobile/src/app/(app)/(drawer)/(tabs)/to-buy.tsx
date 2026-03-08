import { View, TouchableOpacity } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { useQuery } from "react-query"

import BudgetListScreen from "@/components/features/to-buy/budget-list-screen"
import { Spinner } from "@/components/ui/spinner"
import { mockBudgetLists } from "@/utils/mock/budget.mock"
import BudgetAnalytics from "@/components/features/to-buy/budget-analytics"
import { BudgetList } from "@/types/budget"
import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"

export default function ToBuyScreen() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"list" | "analytics">("list")

  const getLists = async function (): Promise<BudgetList[]> {
    return mockBudgetLists
  }

  const { data: budgets, status, refetch, isLoading } = useQuery("budget-lists", getLists)

  const handleBudgetPress = (budget: BudgetList) => {
    router.push({
      pathname: "/(app)/budget/[id]",
      params: { id: budget.id.toString() }
    })
  }

  const handleAddBudget = () => {
    router.push("/(app)/add-budget")
  }

  if (isLoading || !budgets) {
    return (
      <View className="flex-1 bg-background">
        <Spinner size="large" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      {/* View Mode Toggle */}
      <View className="flex-row justify-center mb-4 mt-2">
        <View className="bg-card rounded-xl p-1 border border-border flex-row">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg flex-row items-center ${viewMode === "list" ? "bg-primary" : "bg-transparent"}`}
            onPress={() => setViewMode("list")}
          >
            <Icon name="Menu" className={viewMode === "list" ? "text-primary-foreground" : "text-muted-foreground"} size={16} />
            <Text className={`ml-2 font-medium ${viewMode === "list" ? "text-primary-foreground" : "text-muted-foreground"}`}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg flex-row items-center ${viewMode === "analytics" ? "bg-primary" : "bg-transparent"}`}
            onPress={() => setViewMode("analytics")}
          >
            <Icon name="ChartPie" className={viewMode === "analytics" ? "text-primary-foreground" : "text-muted-foreground"} size={16} />
            <Text className={`ml-2 font-medium ${viewMode === "analytics" ? "text-primary-foreground" : "text-muted-foreground"}`}>
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
