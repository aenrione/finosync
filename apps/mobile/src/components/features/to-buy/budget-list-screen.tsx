import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import React, { useState } from "react"

import { BudgetCard } from "@/components/features/to-buy/budget-card"
import { BudgetList } from "@/types/budget"
import Icon from "@/components/ui/icon"

interface BudgetListScreenProps {
  budgets: BudgetList[];
  onBudgetPress: (budget: BudgetList) => void;
  onAddBudget: () => void;
}

export default function BudgetListScreen({ budgets, onBudgetPress, onAddBudget }: BudgetListScreenProps) {
  const totalBudgets = budgets.length
  const activeBudgets = budgets.filter(b => new Date(b.end_date) >= new Date()).length
  const totalAllocated = budgets.reduce((sum, b) => sum + b.total_budget, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.total, 0)

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5 pb-3 bg-card border-b border-border">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-foreground mb-1">Budget Overview</Text>
            <Text className="text-base text-muted-foreground">Manage your financial plans</Text>
          </View>
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-primary items-center justify-center"
            onPress={onAddBudget}
          >
            <Icon name="Plus" className="text-white" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View className="mt-5 mb-8">
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <View className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-3">
                  <Icon name="DollarSign" className="text-blue-600" size={24} />
                </View>
                <Text className="text-2xl font-bold text-foreground mb-1">${totalAllocated.toFixed(2)}</Text>
                <Text className="text-sm text-muted-foreground font-medium">Total Allocated</Text>
              </View>
            </View>
            <View className="flex-1 ml-2">
              <View className="bg-green-50 rounded-2xl p-5 border border-green-200">
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-3">
                  <Icon name="TrendingUp" className="text-green-600" size={24} />
                </View>
                <Text className="text-2xl font-bold text-foreground mb-1">${totalSpent.toFixed(2)}</Text>
                <Text className="text-sm text-muted-foreground font-medium">Total Spent</Text>
              </View>
            </View>
          </View>
          <View className="flex-row">
            <View className="flex-1 mr-2">
              <View className="bg-orange-50 rounded-2xl p-5 border border-orange-200">
                <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mb-3">
                  <Icon name="Calendar" className="text-orange-600" size={24} />
                </View>
                <Text className="text-2xl font-bold text-foreground mb-1">{activeBudgets}</Text>
                <Text className="text-sm text-muted-foreground font-medium">Active Budgets</Text>
              </View>
            </View>
            <View className="flex-1 ml-2">
              <View className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-3">
                  <Icon name="ShoppingCart" className="text-gray-600" size={24} />
                </View>
                <Text className="text-2xl font-bold text-foreground mb-1">{totalBudgets}</Text>
                <Text className="text-sm text-muted-foreground font-medium">Total Budgets</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Budget Lists */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-foreground mb-4">Your Budgets</Text>
          {budgets.length === 0 ? (
            <View className="bg-card rounded-2xl p-8 border border-border items-center">
              <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
                <Icon name="ShoppingCart" className="text-muted-foreground" size={32} />
              </View>
              <Text className="text-lg font-semibold text-foreground mb-2">No Budgets Yet</Text>
              <Text className="text-sm text-muted-foreground text-center mb-4">
                Create your first budget to start tracking your purchases and expenses.
              </Text>
              <TouchableOpacity 
                className="bg-primary px-6 py-3 rounded-xl flex-row items-center"
                onPress={onAddBudget}
              >
                <Icon name="Plus" className="text-white mr-2" size={20} />
                <Text className="text-white font-semibold">Create Budget</Text>
              </TouchableOpacity>
            </View>
          ) : (
            budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onPress={() => onBudgetPress(budget)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
} 