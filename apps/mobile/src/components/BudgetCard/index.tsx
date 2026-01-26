import { Calendar, DollarSign, ShoppingCart, TrendingUp, TrendingDown } from "lucide-react-native"
import { View, Text, TouchableOpacity } from "react-native"
import React from "react"

import { BudgetList } from "@/types/budget"
import Icon from "@/components/ui/icon"

interface BudgetCardProps {
  budget: BudgetList;
  onPress: () => void;
}

export function BudgetCard({ budget, onPress }: BudgetCardProps) {
  const isOverBudget = budget.total > budget.total_budget
  const remainingBudget = budget.total_budget - budget.total
  const progress = budget.total_budget > 0 ? (budget.total / budget.total_budget) * 100 : 0
  const isActive = new Date(budget.end_date) >= new Date()

  return (
    <TouchableOpacity className="bg-white rounded-2xl p-5 mb-4 border border-border shadow-sm" onPress={onPress}>
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xl font-bold text-foreground flex-1">{budget.title}</Text>
          <View className={`px-3 py-1 rounded-full ${isActive ? "bg-green-100" : "bg-red-100"}`}>
            <Text className={`text-xs font-semibold ${isActive ? "text-green-700" : "text-red-700"}`}>
              {isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
        {budget.description && (
          <Text className="text-sm text-muted-foreground leading-5">{budget.description}</Text>
        )}
      </View>

      <View className="flex-row items-center mb-4">
        <Icon name="Calendar" className="text-muted-foreground mr-2" size={16} />
        <Text className="text-sm text-muted-foreground">
          {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
        </Text>
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="items-center flex-1">
          <Icon name="DollarSign" className="text-blue-600 mb-1" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Budget</Text>
          <Text className="text-base font-bold text-foreground">${budget.total_budget.toFixed(2)}</Text>
        </View>
        <View className="items-center flex-1">
          <Icon name="ShoppingCart" className="text-green-600 mb-1" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Spent</Text>
          <Text className="text-base font-bold text-foreground">${budget.total.toFixed(2)}</Text>
        </View>
        <View className="items-center flex-1">
          {isOverBudget ? (
            <Icon name="TrendingDown" className="text-red-600 mb-1" size={20} />
          ) : (
            <Icon name="TrendingUp" className="text-green-600 mb-1" size={20} />
          )}
          <Text className="text-xs text-muted-foreground mb-1">Remaining</Text>
          <Text className={`text-base font-bold ${isOverBudget ? "text-red-600" : "text-foreground"}`}>
            ${Math.abs(remainingBudget).toFixed(2)}
          </Text>
        </View>
      </View>

      <View className="mb-3">
        <View className="h-2 bg-muted rounded-full">
          <View 
            className={`h-2 rounded-full ${isOverBudget ? "bg-red-500" : "bg-blue-500"}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </View>
        <Text className={`text-sm text-center mt-2 ${isOverBudget ? "text-red-600" : "text-muted-foreground"}`}>
          {progress.toFixed(1)}% {isOverBudget ? "over budget" : "of budget used"}
        </Text>
      </View>

      <View className="border-t border-border pt-3">
        <Text className="text-sm text-muted-foreground text-center">
          {budget.items.length} items • {budget.items.filter(item => item.purchased).length} purchased
        </Text>
      </View>
    </TouchableOpacity>
  )
} 