import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { ArrowLeft, Save, Calendar, DollarSign, FileText } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useMutation, useQueryClient } from "react-query"
import React, { useState } from "react"
import { useRouter } from "expo-router"

import { BudgetList } from "@/types/budget"
import Icon from "@/components/ui/icon"

export default function AddBudgetScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    total_budget: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
  })

  const createBudget = async (data: any): Promise<BudgetList> => {
    // In a real app, this would call an API to create the budget
    console.log("Creating budget:", data)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: Date.now(),
      title: data.title,
      description: data.description,
      total_budget: parseFloat(data.total_budget),
      total: 0,
      start_date: data.start_date,
      end_date: data.end_date,
      items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  const mutation = useMutation({
    mutationFn: createBudget,
    onSuccess: (newBudget) => {
      // Invalidate and refetch budget lists
      queryClient.invalidateQueries("budget-lists")
      
      // Navigate to the new budget detail
      router.push({
        pathname: "/budget/[id]",
        params: { id: newBudget.id.toString() }
      })
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to create budget. Please try again.")
    }
  })

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a budget title.")
      return
    }

    if (!formData.total_budget || parseFloat(formData.total_budget) <= 0) {
      Alert.alert("Error", "Please enter a valid budget amount.")
      return
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      Alert.alert("Error", "End date must be after start date.")
      return
    }

    mutation.mutate(formData)
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-5 pb-3 bg-white border-b border-border">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-muted items-center justify-center"
            onPress={() => router.back()}
          >
            <Icon name="ArrowLeft" className="text-muted-foreground" size={20} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Create Budget</Text>
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-primary items-center justify-center"
            onPress={handleSave}
            disabled={mutation.isPending}
          >
            <Icon name="Save" className="text-white" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5">
          {/* Basic Information */}
          <View className="bg-white rounded-2xl p-5 border border-border mb-5">
            <Text className="text-lg font-semibold text-foreground mb-4">Basic Information</Text>
            
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Icon name="FileText" className="text-muted-foreground mr-2" size={20} />
                <Text className="text-sm font-medium text-foreground">Title *</Text>
              </View>
              <TextInput
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground"
                placeholder="Enter budget title"
                placeholderTextColor="#6B7280"
                value={formData.title}
                onChangeText={(value) => updateFormData("title", value)}
              />
            </View>

            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Icon name="FileText" className="text-muted-foreground mr-2" size={20} />
                <Text className="text-sm font-medium text-foreground">Description</Text>
              </View>
              <TextInput
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground"
                placeholder="Enter budget description (optional)"
                placeholderTextColor="#6B7280"
                value={formData.description}
                onChangeText={(value) => updateFormData("description", value)}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Budget Amount */}
          <View className="bg-white rounded-2xl p-5 border border-border mb-5">
            <Text className="text-lg font-semibold text-foreground mb-4">Budget Amount</Text>
            
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Icon name="DollarSign" className="text-muted-foreground mr-2" size={20} />
                <Text className="text-sm font-medium text-foreground">Total Budget *</Text>
              </View>
              <TextInput
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground"
                placeholder="0.00"
                placeholderTextColor="#6B7280"
                value={formData.total_budget}
                onChangeText={(value) => updateFormData("total_budget", value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Date Range */}
          <View className="bg-white rounded-2xl p-5 border border-border mb-5">
            <Text className="text-lg font-semibold text-foreground mb-4">Date Range</Text>
            
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Icon name="Calendar" className="text-muted-foreground mr-2" size={20} />
                <Text className="text-sm font-medium text-foreground">Start Date</Text>
              </View>
              <TextInput
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#6B7280"
                value={formData.start_date}
                onChangeText={(value) => updateFormData("start_date", value)}
              />
            </View>

            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Icon name="Calendar" className="text-muted-foreground mr-2" size={20} />
                <Text className="text-sm font-medium text-foreground">End Date</Text>
              </View>
              <TextInput
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#6B7280"
                value={formData.end_date}
                onChangeText={(value) => updateFormData("end_date", value)}
              />
            </View>
          </View>

          {/* Summary */}
          <View className="bg-white rounded-2xl p-5 border border-border mb-5">
            <Text className="text-lg font-semibold text-foreground mb-4">Summary</Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Budget Title</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formData.title || "Not set"}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Budget Amount</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formData.total_budget ? `$${parseFloat(formData.total_budget).toFixed(2)}` : "Not set"}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Duration</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formData.start_date && formData.end_date ? 
                    `${new Date(formData.start_date).toLocaleDateString()} - ${new Date(formData.end_date).toLocaleDateString()}` : 
                    "Not set"
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            className="bg-primary px-6 py-4 rounded-xl flex-row items-center justify-center mb-8"
            onPress={handleSave}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <View className="flex-row items-center">
                <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                <Text className="text-white font-semibold">Creating...</Text>
              </View>
            ) : (
              <>
                <Icon name="Save" className="text-white mr-2" size={20} />
                <Text className="text-white font-semibold">Create Budget</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
} 