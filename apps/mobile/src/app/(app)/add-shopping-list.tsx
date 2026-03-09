import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "react-query";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { DollarSign, Save } from "lucide-react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { MoneyInput } from "@/components/ui/money-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormSection } from "@/components/ui/form-section";
import ScreenHeader from "@/components/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import Icon from "@/components/ui/icon";
import { fetchBudgetSummary } from "@/services/budget-period.service";
import { createShoppingList } from "@/services/shopping.service";
import { useStore } from "@/utils/store";
import { showAmount } from "@/utils/currency";

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
      .split("T")[0],
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

  const selectOptions = [
    { value: "", label: "No linked allocation" },
    ...allocationOptions.map((a) => ({
      value: a.id?.toString() ?? "",
      label: `${a.label} ($${a.plannedAmount.toFixed(2)})`,
    })),
  ];

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

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="pt-4" />

          {/* Basic Information */}
          <FormSection title="Basic Information">
            <FormField
              label="Title"
              placeholder="Enter shopping list title"
              value={formData.title}
              onChangeText={(value) => updateFormData("title", value)}
              required
            />

            <FormField
              label="Description"
              placeholder="Enter description (optional)"
              value={formData.description}
              onChangeText={(value) => updateFormData("description", value)}
              multiline
              numberOfLines={3}
              containerClassName="mb-0"
            />
          </FormSection>

          {/* Spending Cap */}
          <FormSection title="Spending Cap">
            <MoneyInput
              label="Total Cap"
              placeholder="0.00"
              value={formData.total_budget}
              onChangeValue={(value) => updateFormData("total_budget", value)}
              icon={DollarSign}
              required
              containerClassName="mb-0"
            />
          </FormSection>

          {/* Budget Link */}
          <FormSection
            title="Budget Link"
            description="Link this list to a monthly budget category so planning stays tied to your active budget."
          >
            <FormSelect
              label="Monthly Allocation"
              options={selectOptions}
              value={formData.budget_allocation_id}
              onValueChange={(value) =>
                updateFormData("budget_allocation_id", value?.toString() ?? "")
              }
              containerClassName="mb-0"
            />
          </FormSection>

          {/* Date Range */}
          <FormSection title="Date Range">
            <FormField
              label="Start Date"
              placeholder="YYYY-MM-DD"
              value={formData.start_date}
              onChangeText={(value) => updateFormData("start_date", value)}
            />

            <FormField
              label="End Date"
              placeholder="YYYY-MM-DD"
              value={formData.end_date}
              onChangeText={(value) => updateFormData("end_date", value)}
              containerClassName="mb-0"
            />
          </FormSection>

          {/* Summary */}
          <View className="rounded-xl border border-primary/20 bg-primary-light p-4 mb-4">
            <Text className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Summary
            </Text>

            <View className="gap-2.5">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">List Title</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formData.title || "Not set"}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Spending Cap</Text>
                <Text className="text-sm font-semibold text-primary">
                  {formData.total_budget
                    ? showAmount(formData.total_budget)
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
                <Text className="text-sm text-muted-foreground">Budget Link</Text>
                <Text className="text-sm font-medium text-foreground">
                  {allocationOptions.find(
                    (a) => a.id?.toString() === formData.budget_allocation_id,
                  )?.label || "None"}
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <Button
            className="w-full mb-8"
            size="lg"
            onPress={handleSave}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? (
              <View className="flex-row items-center">
                <Spinner size="small" color="white" />
                <ButtonText className="ml-2">Creating...</ButtonText>
              </View>
            ) : (
              <ButtonText size="lg">Create Shopping List</ButtonText>
            )}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
