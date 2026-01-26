import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, ChartPie } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { View, Text, ScrollView } from "react-native"
import React from "react"

import { BudgetList, BudgetStats } from "@/types/budget"
import Icon from "@/components/ui/icon"

interface BudgetAnalyticsProps {
  budgets: BudgetList[];
}

export default function BudgetAnalytics({ budgets }: BudgetAnalyticsProps) {
  const totalBudget = budgets.reduce((sum, b) => sum + b.total_budget, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.total, 0)
  const totalItems = budgets.reduce((sum, b) => sum + b.items.length, 0)
  const purchasedItems = budgets.reduce((sum, b) => sum + b.items.filter(i => i.purchased).length, 0)
  
  const averageBudget = budgets.length > 0 ? totalBudget / budgets.length : 0
  const savingsRate = totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget) * 100 : 0
  const completionRate = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0

  const overBudgetCount = budgets.filter(b => b.total > b.total_budget).length

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5 pb-3 bg-white border-b border-border">
        <Text className="text-2xl font-bold text-foreground mb-1">Budget Analytics</Text>
        <Text className="text-base text-muted-foreground">Track your financial progress</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View className="mt-5">
          <Text className="text-xl font-semibold text-foreground mb-4">Key Metrics</Text>
          <View className="flex-row flex-wrap -mx-3">
            <View className="w-1/2 px-3 mb-3">
              <View className="bg-white rounded-2xl p-4 border border-border">
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-3">
                  <Icon name="DollarSign" className="text-blue-600" size={24} />
                </View>
                <Text className="text-2xl font-bold text-foreground mb-1">${totalBudget.toFixed(2)}</Text>
                <Text className="text-sm text-muted-foreground text-center">Total Budget</Text>
              </View>
            </View>
            <View className="w-1/2 px-3 mb-3">
              <View className="bg-white rounded-2xl p-4 border border-border">
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-3">
                  <Icon name="TrendingUp" className="text-green-600" size={24} />
                </View>
                <Text className="text-2xl font-bold text-foreground mb-1">${totalSpent.toFixed(2)}</Text>
                <Text className="text-sm text-muted-foreground text-center">Total Spent</Text>
              </View>
            </View>
            <View className="w-1/2 px-3 mb-3">
              <View className="bg-white rounded-2xl p-4 border border-border">
                <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mb-3">
                  <Icon name="Target" className="text-orange-600" size={24} />
                </View>
                <Text className="text-2xl font-bold text-foreground mb-1">${averageBudget.toFixed(2)}</Text>
                <Text className="text-sm text-muted-foreground text-center">Avg Budget</Text>
              </View>
            </View>
            <View className="w-1/2 px-3 mb-3">
              <View className="bg-white rounded-2xl p-4 border border-border">
                <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-3">
                  <Icon name="ChartPie" className="text-purple-600" size={24} />
                </View>
                <Text className="text-2xl font-bold text-foreground mb-1">{savingsRate.toFixed(1)}%</Text>
                <Text className="text-sm text-muted-foreground text-center">Savings Rate</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Performance Indicators */}
        <View className="mt-5">
          <Text className="text-xl font-semibold text-foreground mb-4">Performance</Text>
          
          <View className="bg-white rounded-2xl p-4 mb-3 border border-border">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                <Icon name="Calendar" className="text-green-600" size={20} />
              </View>
              <Text className="text-base font-semibold text-foreground flex-1">Purchase Completion</Text>
              <Text className="text-lg font-bold text-foreground">{completionRate.toFixed(1)}%</Text>
            </View>
            <View className="h-2 bg-muted rounded-full mb-2">
              <View 
                className="h-2 rounded-full bg-green-500" 
                style={{ width: `${completionRate}%` }} 
              />
            </View>
            <Text className="text-sm text-muted-foreground">
              {purchasedItems} of {totalItems} items purchased
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-4 mb-3 border border-border">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
                <Icon name="TrendingDown" className="text-red-600" size={20} />
              </View>
              <Text className="text-base font-semibold text-foreground flex-1">Over Budget</Text>
              <Text className="text-lg font-bold text-foreground">{overBudgetCount}</Text>
            </View>
            <View className="h-2 bg-muted rounded-full mb-2">
              <View 
                className="h-2 rounded-full bg-red-500" 
                style={{ width: `${budgets.length > 0 ? (overBudgetCount / budgets.length) * 100 : 0}%` }} 
              />
            </View>
            <Text className="text-sm text-muted-foreground">
              {overBudgetCount} of {budgets.length} budgets exceeded
            </Text>
          </View>
        </View>

        {/* Budget Breakdown */}
        <View className="mt-5">
          <Text className="text-xl font-semibold text-foreground mb-4">Budget Breakdown</Text>
          {budgets.map((budget) => {
            const spent = budget.total
            const remaining = budget.total_budget - spent
            const percentage = budget.total_budget > 0 ? (spent / budget.total_budget) * 100 : 0
            const isOverBudget = spent > budget.total_budget

            return (
              <View key={budget.id} className="bg-white rounded-2xl p-4 mb-3 border border-border">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-base font-semibold text-foreground">{budget.title}</Text>
                  <Text className={`text-base font-bold ${isOverBudget ? "text-red-600" : "text-blue-600"}`}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-sm text-muted-foreground">${spent.toFixed(2)} spent</Text>
                  <Text className={`text-sm ${isOverBudget ? "text-red-600" : "text-green-600"}`}>
                    ${remaining.toFixed(2)} {isOverBudget ? "over" : "remaining"}
                  </Text>
                </View>
                <View className="h-2 bg-muted rounded-full">
                  <View 
                    className={`h-2 rounded-full ${isOverBudget ? "bg-red-500" : "bg-blue-500"}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </View>
              </View>
            )
          })}
        </View>

        {/* Insights */}
        <View className="mt-5 mb-8">
          <Text className="text-xl font-semibold text-foreground mb-4">Insights</Text>
          
          <View className="bg-white rounded-2xl p-4 mb-3 border border-border flex-row">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
              <Icon name="TrendingUp" className="text-green-600" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground mb-1">Great Progress!</Text>
              <Text className="text-sm text-muted-foreground leading-5">
                You've maintained a {savingsRate.toFixed(1)}% savings rate across your budgets. 
                Keep up the good work!
              </Text>
            </View>
          </View>

          {overBudgetCount > 0 && (
            <View className="bg-white rounded-2xl p-4 mb-3 border border-border flex-row">
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                <Icon name="TrendingDown" className="text-red-600" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground mb-1">Budget Alert</Text>
                <Text className="text-sm text-muted-foreground leading-5">
                  {overBudgetCount} budget{overBudgetCount > 1 ? "s" : ""} exceeded the allocated amount. 
                  Consider adjusting your spending or budget limits.
                </Text>
              </View>
            </View>
          )}

          <View className="bg-white rounded-2xl p-4 mb-3 border border-border flex-row">
            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
              <Icon name="Target" className="text-purple-600" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground mb-1">Purchasing Pattern</Text>
              <Text className="text-sm text-muted-foreground leading-5">
                You've completed {completionRate.toFixed(1)}% of your planned purchases. 
                {completionRate < 50 ? " Consider reviewing your purchase priorities." : " You're on track with your spending plan."}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
} 