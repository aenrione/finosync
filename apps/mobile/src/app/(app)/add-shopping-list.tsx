import { Picker } from "@react-native-picker/picker";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "react-query";
import React, { useState } from "react";
import { useRouter } from "expo-router";

import { Button, ButtonText } from "@/components/ui/button";
import ScreenHeader from "@/components/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import Icon from "@/components/ui/icon";
import { fetchBudgetSummary } from "@/services/budget-period.service";
import { createShoppingList } from "@/services/shopping.service";
import { useStore } from "@/utils/store";

export default function AddShoppingListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const baseCurrency = useStore((state) => state.baseCurrency);
  const today = new Date();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    total_budget: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days from now
    budget_allocation_id: "",
  });

  const { data: budgetSummary } = useQuery(
    ["budget-summary", today.getFullYear(), today.getMonth() + 1, baseCurrency],
    () =>
      fetchBudgetSummary(
        today.getFullYear(),
        today.getMonth() + 1,
        baseCurrency,
      ),
  );

  const allocationOptions = (budgetSummary?.groups ?? []).flatMap((group) =>
    group.allocations.map((allocation) => ({
      id: allocation.id,
      label: `${allocation.category_name} - ${group.group.name}`,
      plannedAmount: allocation.planned_amount,
    })),
  );

  const mutation = useMutation({
    mutationFn: () =>
      createShoppingList({
        ...formData,
        total_budget: parseFloat(formData.total_budget),
        budget_allocation_id: formData.budget_allocation_id
          ? parseInt(formData.budget_allocation_id, 10)
          : undefined,
      }),
    onSuccess: (newShoppingList) => {
      queryClient.invalidateQueries(["shopping-lists"]);
      router.push({
        pathname: "/(app)/shopping/[id]",
        params: { id: newShoppingList.id.toString() },
      });
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to create shopping list. Please try again.",
      );
    },
  });

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a shopping list title.");
      return;
    }

    if (!formData.total_budget || parseFloat(formData.total_budget) <= 0) {
      Alert.alert("Error", "Please enter a valid spending cap.");
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      Alert.alert("Error", "End date must be after start date.");
      return;
    }

    mutation.mutate();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        variant="back"
        title="Create Shopping List"
        rightActions={[{ icon: "Save", onPress: handleSave }]}
      />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5">
          {/* Basic Information */}
          <View className="bg-card rounded-2xl p-5 border border-border mb-5">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Basic Information
            </Text>

            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Icon
                  name="FileText"
                  className="text-muted-foreground mr-2"
                  size={20}
                />
                <Text className="text-sm font-medium text-foreground">
                  Title *
                </Text>
              </View>
              <Input
                className="w-full px-4 py-3 rounded-xl"
                placeholder="Enter shopping list title"
                value={formData.title}
                onChangeText={(value) => updateFormData("title", value)}
              />
            </View>

            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Icon
                  name="FileText"
                  className="text-muted-foreground mr-2"
                  size={20}
                />
                <Text className="text-sm font-medium text-foreground">
                  Description
                </Text>
              </View>
              <Input
                className="w-full px-4 py-3 rounded-xl"
                placeholder="Enter shopping list description (optional)"
                value={formData.description}
                onChangeText={(value) => updateFormData("description", value)}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Spending cap */}
          <View className="bg-card rounded-2xl p-5 border border-border mb-5">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Spending Cap
            </Text>

            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Icon
                  name="DollarSign"
                  className="text-muted-foreground mr-2"
                  size={20}
                />
                <Text className="text-sm font-medium text-foreground">
                  Total Cap *
                </Text>
              </View>
              <Input
                className="w-full px-4 py-3 rounded-xl"
                placeholder="0.00"
                value={formData.total_budget}
                onChangeText={(value) => updateFormData("total_budget", value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View className="bg-card rounded-2xl p-5 border border-border mb-5">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Budget Link
            </Text>

            <View className="mb-2">
              <Text className="text-sm font-medium text-foreground mb-2">
                Monthly Allocation
              </Text>
              <View className="rounded-lg bg-muted border border-border overflow-hidden">
                <Picker
                  selectedValue={formData.budget_allocation_id}
                  onValueChange={(value) =>
                    updateFormData(
                      "budget_allocation_id",
                      value?.toString() ?? "",
                    )
                  }
                >
                  <Picker.Item label="No linked allocation" value="" />
                  {allocationOptions.map((allocation) => (
                    <Picker.Item
                      key={allocation.id ?? allocation.label}
                      label={`${allocation.label} ($${allocation.plannedAmount.toFixed(2)})`}
                      value={allocation.id?.toString() ?? ""}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <Text className="text-sm text-muted-foreground">
              Link this list to a monthly budget category so planning stays tied
              to your active budget.
            </Text>
          </View>

          {/* Date Range */}
          <View className="bg-card rounded-2xl p-5 border border-border mb-5">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Date Range
            </Text>

            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Icon
                  name="Calendar"
                  className="text-muted-foreground mr-2"
                  size={20}
                />
                <Text className="text-sm font-medium text-foreground">
                  Start Date
                </Text>
              </View>
              <Input
                className="w-full px-4 py-3 rounded-xl"
                placeholder="YYYY-MM-DD"
                value={formData.start_date}
                onChangeText={(value) => updateFormData("start_date", value)}
              />
            </View>

            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Icon
                  name="Calendar"
                  className="text-muted-foreground mr-2"
                  size={20}
                />
                <Text className="text-sm font-medium text-foreground">
                  End Date
                </Text>
              </View>
              <Input
                className="w-full px-4 py-3 rounded-xl"
                placeholder="YYYY-MM-DD"
                value={formData.end_date}
                onChangeText={(value) => updateFormData("end_date", value)}
              />
            </View>
          </View>

          {/* Summary */}
          <View className="bg-card rounded-2xl p-5 border border-border mb-5">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Summary
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">
                  List Title
                </Text>
                <Text className="text-sm font-medium text-foreground">
                  {formData.title || "Not set"}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">
                  Spending Cap
                </Text>
                <Text className="text-sm font-medium text-foreground">
                  {formData.total_budget
                    ? `$${parseFloat(formData.total_budget).toFixed(2)}`
                    : "Not set"}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Duration</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formData.start_date && formData.end_date
                    ? `${new Date(formData.start_date).toLocaleDateString()} - ${new Date(formData.end_date).toLocaleDateString()}`
                    : "Not set"}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">
                  Budget Link
                </Text>
                <Text className="text-sm font-medium text-foreground">
                  {allocationOptions.find(
                    (allocation) =>
                      allocation.id?.toString() ===
                      formData.budget_allocation_id,
                  )?.label || "None"}
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <Button
            className="rounded-xl py-4 mb-8"
            onPress={handleSave}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? (
              <View className="flex-row items-center">
                <Spinner size="small" color="white" />
                <ButtonText className="ml-2">Creating...</ButtonText>
              </View>
            ) : (
              <>
                <Icon
                  name="Save"
                  className="text-primary-foreground mr-2"
                  size={20}
                />
                <ButtonText>Create Shopping List</ButtonText>
              </>
            )}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
