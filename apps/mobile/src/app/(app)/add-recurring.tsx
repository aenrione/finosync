import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { DollarSign, FileText, MessageSquare } from "lucide-react-native";

import ScreenHeader from "@/components/screen-header";
import { Button, ButtonText } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { MoneyInput } from "@/components/ui/money-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormDatePicker } from "@/components/ui/form-date-picker";
import { FormToggle } from "@/components/ui/form-toggle";
import { FormSection } from "@/components/ui/form-section";
import { Text } from "@/components/ui/text";
import { useCategories } from "@/context/categories.context";
import { useDashboard } from "@/context/dashboard.context";
import { useStore } from "@/utils/store";
import { recurringTransactionService } from "@/services/recurring-transaction.service";
import {
  RecurringFrequency,
  RecurringTransactionFormData,
} from "@/types/recurring-transaction";
import { colors } from "@/lib/colors";

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annually", label: "Semi-annually" },
  { value: "annually", label: "Annually" },
];

const AddRecurring = () => {
  const router = useRouter();
  const { categoriesData: categories } = useCategories();
  const { accounts } = useDashboard();
  const currentRecurring = useStore(
    (state) => state.currentRecurringTransaction,
  );
  const setCurrentRecurring = useStore(
    (state) => state.setCurrentRecurringTransaction,
  );

  const isEditing = !!currentRecurring;

  const [name, setName] = useState(currentRecurring?.name || "");
  const [amount, setAmount] = useState(
    currentRecurring?.amount?.toString() || "",
  );
  const [isExpense, setIsExpense] = useState(
    currentRecurring ? currentRecurring.transaction_type === "expense" : true,
  );
  const [frequency, setFrequency] = useState<RecurringFrequency>(
    currentRecurring?.frequency || "monthly",
  );
  const [startDate, setStartDate] = useState(
    currentRecurring ? new Date(currentRecurring.start_date) : new Date(),
  );
  const [nextDueDate, setNextDueDate] = useState(
    currentRecurring ? new Date(currentRecurring.next_due_date) : new Date(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    currentRecurring?.end_date
      ? new Date(currentRecurring.end_date)
      : undefined,
  );
  const [autoCreate, setAutoCreate] = useState(
    currentRecurring?.auto_create || false,
  );
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    currentRecurring?.account_id || null,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    currentRecurring?.transaction_category_id || null,
  );
  const [notes, setNotes] = useState(currentRecurring?.notes || "");
  const [loading, setLoading] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(!!currentRecurring?.end_date);

  const localAccounts =
    accounts?.filter((a) => a.account_type === "local") || [];

  useEffect(() => {
    if (autoCreate && !selectedAccountId && localAccounts.length > 0) {
      setSelectedAccountId(localAccounts[0].id as number);
    }
  }, [autoCreate, selectedAccountId, localAccounts]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (autoCreate && !selectedAccountId) {
      Alert.alert("Error", "Auto-create requires an account");
      return;
    }

    setLoading(true);
    try {
      const data: RecurringTransactionFormData = {
        name: name.trim(),
        amount: numAmount,
        frequency,
        start_date: startDate.toISOString().split("T")[0],
        next_due_date: nextDueDate.toISOString().split("T")[0],
        end_date:
          hasEndDate && endDate
            ? endDate.toISOString().split("T")[0]
            : undefined,
        transaction_type: isExpense ? "expense" : "income",
        auto_create: autoCreate,
        account_id: selectedAccountId || undefined,
        transaction_category_id: selectedCategoryId || undefined,
        notes: notes.trim() || undefined,
      };

      if (isEditing) {
        await recurringTransactionService.update(currentRecurring.id, data);
      } else {
        await recurringTransactionService.create(data);
      }

      setCurrentRecurring(undefined);
      router.back();
    } catch (error) {
      console.error("Failed to save recurring transaction:", error);
      Alert.alert("Error", "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentRecurring(undefined);
    router.back();
  };

  const frequencyOptions = FREQUENCIES.map((f) => ({
    value: f.value,
    label: f.label,
  }));

  const accountOptions = localAccounts.map((account) => ({
    value: account.id as number,
    label: account.account_name,
  }));

  const categoryOptions = [
    { value: null, label: "No Category" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title={isEditing ? "Edit Recurring" : "New Recurring"}
        variant="back"
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
          <View className="pt-2" />

          {/* Basics */}
          <FormSection title="Basics">
            <FormField
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Netflix, Rent..."
              icon={FileText}
              required
            />

            <MoneyInput
              label="Amount"
              value={amount}
              onChangeValue={setAmount}
              placeholder="0"
              icon={DollarSign}
              required
            />

            <FormToggle
              label="Type"
              value={!isExpense}
              onValueChange={(v) => setIsExpense(!v)}
              variant="segment"
              leftLabel="Income"
              rightLabel="Expense"
              leftColor={colors.income}
              rightColor={colors.expense}
            />

            <FormSelect
              label="Frequency"
              options={frequencyOptions}
              value={frequency}
              onValueChange={(v) => setFrequency(v as RecurringFrequency)}
              required
              containerClassName="mb-0"
            />
          </FormSection>

          {/* Schedule */}
          <FormSection title="Schedule">
            <FormDatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
            />

            <FormDatePicker
              label="Next Due Date"
              value={nextDueDate}
              onChange={setNextDueDate}
            />

            <FormToggle
              value={hasEndDate}
              onValueChange={setHasEndDate}
              title="Has End Date"
              subtitle="Set an optional end date for this recurring transaction"
            />

            {hasEndDate && (
              <FormDatePicker
                label="End Date"
                value={endDate || new Date()}
                onChange={setEndDate}
                containerClassName="mb-0"
              />
            )}
          </FormSection>

          {/* Automation */}
          <FormSection title="Automation">
            <FormToggle
              value={autoCreate}
              onValueChange={setAutoCreate}
              title="Auto-create transactions"
              subtitle="Automatically create a transaction when due"
            />

            {autoCreate && (
              <FormSelect
                label="Account"
                options={accountOptions}
                value={selectedAccountId}
                onValueChange={(v) => setSelectedAccountId(v as number | null)}
                required
                helperText="Required for auto-create"
              />
            )}
          </FormSection>

          {/* Classification */}
          <FormSection title="Classification">
            <FormSelect
              label="Category"
              options={categoryOptions}
              value={selectedCategoryId}
              onValueChange={(v) => setSelectedCategoryId(v as number | null)}
            />

            <FormField
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              multiline
              numberOfLines={3}
              icon={MessageSquare}
              containerClassName="mb-0"
            />
          </FormSection>

          <View className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View className="px-5 py-4 border-t border-border bg-background">
        <View className="flex-row gap-3">
          <Button variant="secondary" onPress={handleCancel} className="flex-1">
            <ButtonText variant="secondary">Cancel</ButtonText>
          </Button>
          <Button disabled={loading} onPress={handleSave} className="flex-1">
            <ButtonText>
              {loading ? "Saving..." : isEditing ? "Update" : "Create"}
            </ButtonText>
          </Button>
        </View>
      </View>
    </View>
  );
};

export default AddRecurring;
