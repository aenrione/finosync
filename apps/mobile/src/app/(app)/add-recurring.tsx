import { useRouter } from "expo-router"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"
import React, { useEffect, useState } from "react"
import {
  Alert,
  Platform,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from "react-native"

import BackHeader from "@/components/back-header"
import { Button, ButtonText } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { useCategories } from "@/context/categories.context"
import { useDashboard } from "@/context/dashboard.context"
import { useStore } from "@/utils/store"
import { recurringTransactionService } from "@/services/recurring-transaction.service"
import { RecurringFrequency, RecurringTransactionFormData } from "@/types/recurring-transaction"

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annually", label: "Semi-annually" },
  { value: "annually", label: "Annually" },
]

const AddRecurring = () => {
  const router = useRouter()
  const { categoriesData: categories } = useCategories()
  const { accounts } = useDashboard()
  const currentRecurring = useStore((state) => state.currentRecurringTransaction)
  const setCurrentRecurring = useStore((state) => state.setCurrentRecurringTransaction)

  const isEditing = !!currentRecurring

  const [name, setName] = useState(currentRecurring?.name || "")
  const [amount, setAmount] = useState(currentRecurring?.amount?.toString() || "")
  const [isExpense, setIsExpense] = useState(
    currentRecurring ? currentRecurring.transaction_type === "expense" : true
  )
  const [frequency, setFrequency] = useState<RecurringFrequency>(
    currentRecurring?.frequency || "monthly"
  )
  const [startDate, setStartDate] = useState(
    currentRecurring ? new Date(currentRecurring.start_date) : new Date()
  )
  const [nextDueDate, setNextDueDate] = useState(
    currentRecurring ? new Date(currentRecurring.next_due_date) : new Date()
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    currentRecurring?.end_date ? new Date(currentRecurring.end_date) : undefined
  )
  const [autoCreate, setAutoCreate] = useState(currentRecurring?.auto_create || false)
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    currentRecurring?.account_id || null
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    currentRecurring?.transaction_category_id || null
  )
  const [notes, setNotes] = useState(currentRecurring?.notes || "")
  const [loading, setLoading] = useState(false)

  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showNextDueDatePicker, setShowNextDueDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [hasEndDate, setHasEndDate] = useState(!!currentRecurring?.end_date)

  const localAccounts = accounts?.filter((a) => a.account_type === "local") || []

  useEffect(() => {
    if (autoCreate && !selectedAccountId && localAccounts.length > 0) {
      setSelectedAccountId(localAccounts[0].id as number)
    }
  }, [autoCreate, selectedAccountId, localAccounts])

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name")
      return
    }
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount")
      return
    }
    if (autoCreate && !selectedAccountId) {
      Alert.alert("Error", "Auto-create requires an account")
      return
    }

    setLoading(true)
    try {
      const data: RecurringTransactionFormData = {
        name: name.trim(),
        amount: numAmount,
        frequency,
        start_date: startDate.toISOString().split("T")[0],
        next_due_date: nextDueDate.toISOString().split("T")[0],
        end_date: hasEndDate && endDate ? endDate.toISOString().split("T")[0] : undefined,
        transaction_type: isExpense ? "expense" : "income",
        auto_create: autoCreate,
        account_id: selectedAccountId || undefined,
        transaction_category_id: selectedCategoryId || undefined,
        notes: notes.trim() || undefined,
      }

      if (isEditing) {
        await recurringTransactionService.update(currentRecurring.id, data)
      } else {
        await recurringTransactionService.create(data)
      }

      setCurrentRecurring(undefined)
      router.back()
    } catch (error) {
      console.error("Failed to save recurring transaction:", error)
      Alert.alert("Error", "Failed to save")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setCurrentRecurring(undefined)
    router.back()
  }

  return (
    <View className="flex-1 bg-background">
      <BackHeader title={isEditing ? "Edit Recurring" : "New Recurring"} />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Name */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">Name</Text>
          <Input value={name} onChangeText={setName} placeholder="e.g., Netflix, Rent..." />
        </View>

        {/* Amount */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">Amount</Text>
          <Input
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>

        {/* Type Toggle */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">Type</Text>
          <View className="flex-row justify-between items-center p-4 rounded-lg bg-muted border border-border">
            <Text className={`text-base font-medium ${!isExpense ? "text-green-600" : "text-muted-foreground"}`}>
              Income
            </Text>
            <Switch value={isExpense} onValueChange={setIsExpense} />
            <Text className={`text-base font-medium ${isExpense ? "text-red-600" : "text-muted-foreground"}`}>
              Expense
            </Text>
          </View>
        </View>

        {/* Frequency */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">Frequency</Text>
          <View className="rounded-lg bg-muted border border-border overflow-hidden">
            <Picker
              selectedValue={frequency}
              onValueChange={(value) => setFrequency(value)}
              className="text-foreground"
            >
              {FREQUENCIES.map((f) => (
                <Picker.Item key={f.value} label={f.label} value={f.value} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Start Date */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">Start Date</Text>
          <TouchableOpacity
            onPress={() => setShowStartDatePicker(true)}
            className="p-4 rounded-lg bg-muted border border-border"
          >
            <Text className="text-foreground">{startDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              onChange={(_, d) => { setShowStartDatePicker(Platform.OS === "ios"); if (d) setStartDate(d) }}
            />
          )}
        </View>

        {/* Next Due Date */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">Next Due Date</Text>
          <TouchableOpacity
            onPress={() => setShowNextDueDatePicker(true)}
            className="p-4 rounded-lg bg-muted border border-border"
          >
            <Text className="text-foreground">{nextDueDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showNextDueDatePicker && (
            <DateTimePicker
              value={nextDueDate}
              mode="date"
              onChange={(_, d) => { setShowNextDueDatePicker(Platform.OS === "ios"); if (d) setNextDueDate(d) }}
            />
          )}
        </View>

        {/* End Date Toggle */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-muted-foreground">End Date (optional)</Text>
            <Switch value={hasEndDate} onValueChange={setHasEndDate} />
          </View>
          {hasEndDate && (
            <>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                className="p-4 rounded-lg bg-muted border border-border"
              >
                <Text className="text-foreground">
                  {endDate ? endDate.toLocaleDateString() : "Select end date"}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  onChange={(_, d) => { setShowEndDatePicker(Platform.OS === "ios"); if (d) setEndDate(d) }}
                />
              )}
            </>
          )}
        </View>

        {/* Auto Create Toggle */}
        <View className="mb-6 flex-row items-center justify-between p-4 rounded-lg bg-muted border border-border">
          <View className="flex-1 mr-4">
            <Text className="text-sm font-medium text-foreground">Auto-create transactions</Text>
            <Text className="text-xs text-muted-foreground">
              Automatically create a transaction when due
            </Text>
          </View>
          <Switch value={autoCreate} onValueChange={setAutoCreate} />
        </View>

        {/* Account Picker (required when auto-create) */}
        {autoCreate && (
          <View className="mb-6">
            <Text className="text-sm text-muted-foreground mb-2">Account (required for auto-create)</Text>
            <View className="rounded-lg bg-muted border border-border overflow-hidden">
              <Picker
                selectedValue={selectedAccountId}
                onValueChange={(value) => setSelectedAccountId(value)}
                className="text-foreground"
              >
                {localAccounts.map((account) => (
                  <Picker.Item key={account.id} label={account.account_name} value={account.id} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Category Picker */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">Category (optional)</Text>
          <View className="rounded-lg bg-muted border border-border overflow-hidden">
            <Picker
              selectedValue={selectedCategoryId}
              onValueChange={(value) => setSelectedCategoryId(value)}
              className="text-foreground"
            >
              <Picker.Item label="No Category" value={null} />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Notes */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">Notes (optional)</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View className="p-6 border-t border-border bg-background">
        <View className="flex-row space-x-3">
          <Button variant="secondary" onPress={handleCancel} className="flex-1">
            <ButtonText variant="secondary">Cancel</ButtonText>
          </Button>
          <Button disabled={loading} onPress={handleSave} className="flex-1">
            <ButtonText>{loading ? "Saving..." : isEditing ? "Update" : "Create"}</ButtonText>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default AddRecurring
