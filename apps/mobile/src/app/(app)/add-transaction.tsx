import {
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Picker } from "@react-native-picker/picker"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { useTransactions } from "@/context/transactions.context"
import { useCategories } from "@/context/categories.context"
import { useDashboard } from "@/context/dashboard.context"
import BackHeader from "@/components/back-header"
import { useAccounts } from "@/context/accounts.context"
import { Button, ButtonText } from "@/components/ui/button"
import { Transaction } from "@/types/transaction"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { useStore } from "@/utils/store"
import { TagSelector } from "@/components/features/tags/tag-selector"
import { tagService } from "@/services/tag.service"

const AddTransaction = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { accountId } = useLocalSearchParams<{ accountId?: string }>()
  const { createTransaction, updateTransaction } = useTransactions()
  const { categoriesData: categories } = useCategories()
  const { accounts } = useDashboard()

  const transaction = useStore((state) => state.currentTransaction)
  const setCurrentTransaction = useStore((state) => state.setCurrentTransaction)

  const [description, setDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [isIncome, setIsIncome] = useState(true)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [date, setDate] = useState(new Date())
  const [amount, setAmount] = useState("")
  const [comment, setComment] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  // Filter accounts to only show local accounts for manual transactions
  const localAccounts = accounts?.filter(account => account.account_type === "local") || []

  const parseAmount = (value: string): number => {
    const numValue = parseFloat(value) || 0
    return isIncome ? Math.abs(numValue) : -Math.abs(numValue)
  }

  const isValid = (): boolean => !!(
    selectedAccount &&
      description.trim() &&
      amount.trim() &&
      parseFloat(amount) > 0
  )

  useEffect(() => {
    if (transaction) {
      // Editing existing transaction
      setDescription(transaction.description || "")
      setSelectedCategory(transaction.transaction_category_id || null)
      setSelectedAccount(transaction.account_id || null)
      setAmount(Math.abs(transaction.amount).toString())
      setIsIncome(transaction.amount >= 0)
      setDate(new Date(transaction.transaction_date))
      setComment(transaction.comment || "")
      setSelectedTagIds(transaction.tags?.map((t) => t.id) || [])
    } else {
      // Creating new transaction
      if (accountId && localAccounts.length > 0) {
        // Pre-select account from URL parameter
        const accountIdNum = parseInt(accountId)
        const targetAccount = localAccounts.find(acc => acc.id === accountIdNum)
        if (targetAccount) {
          setSelectedAccount(targetAccount.id as number)
        } else {
          // Fallback to first local account if specified account not found
          setSelectedAccount(localAccounts[0].id as number)
        }
      } else if (localAccounts.length > 0) {
        // Default to first local account
        setSelectedAccount(localAccounts[0].id as number)
      }

      if (categories.length > 0) {
        setSelectedCategory(categories[0].id)
      }
    }
  }, [transaction, localAccounts, categories, accountId])

  const handleSave = async () => {
    if (!isValid()) return

    try {
      setLoading(true)

      const transactionData = {
        description: description.trim(),
        amount: parseAmount(amount),
        transaction_date: date.toISOString().split("T")[0],
        account_id: selectedAccount!,
        transaction_category_id: selectedCategory || undefined,
        comment: comment.trim() || undefined,
      }

      if (transaction) {
        // Update existing transaction
        await updateTransaction(transaction.id, transactionData)
        if (selectedTagIds.length > 0) {
          await tagService.setTransactionTags(transaction.id, selectedTagIds)
        }
        Alert.alert("Success", "Transaction updated successfully")
      } else {
        // Create new transaction
        const created = await createTransaction(transactionData)
        if (selectedTagIds.length > 0 && created?.id) {
          await tagService.setTransactionTags(created.id, selectedTagIds)
        }
        Alert.alert("Success", "Transaction created successfully")
      }

      // Clear current transaction and go back
      setCurrentTransaction(undefined)
      router.back()
    } catch (error) {
      console.error("Error saving transaction:", error)
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save transaction")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setCurrentTransaction(undefined)
    router.back()
  }

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  if (localAccounts.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <BackHeader title={transaction ? t("new_transaction.edit") : t("new_transaction.new")} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-foreground text-lg text-center mb-4">
            You need to create a local account first to add manual transactions.
          </Text>
          <Button
            onPress={() => router.push("/(app)/add-account")}
          >
            <ButtonText>Create Local Account</ButtonText>
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <BackHeader title={transaction ? t("new_transaction.edit") : t("new_transaction.new")} />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">{t("new_transaction.amount")}</Text>
          <Input
            value={amount}
            placeholder={t("new_transaction.amount_placeholder")}
            keyboardType="numeric"
            onChangeText={setAmount}
            className="w-full"
          />
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">{t("new_transaction.desc")}</Text>
          <Input
            value={description}
            placeholder={t("new_transaction.desc_placeholder")}
            onChangeText={setDescription}
            className="w-full"
          />
        </View>

        {/* Comment */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">Comment (Optional)</Text>
          <Input
            value={comment}
            placeholder="Add a comment..."
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            className="w-full"
          />
        </View>

        {/* Account Picker */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">{t("new_transaction.account")}</Text>
          <View className="rounded-lg bg-muted border border-border overflow-hidden">
            <Picker
              selectedValue={selectedAccount}
              onValueChange={(value) => setSelectedAccount(value)}
              className="text-foreground"
            >
              {localAccounts.map((account) => (
                <Picker.Item
                  key={account.id}
                  label={account.account_name}
                  value={account.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Category Picker */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">
            {t("new_transaction.category")} (Optional)
          </Text>
          <View className="rounded-lg bg-muted border border-border overflow-hidden">
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
              className="text-foreground"
            >
              <Picker.Item label="No Category" value={null} />
              {categories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Tags */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">Tags (Optional)</Text>
          <TagSelector
            selectedTagIds={selectedTagIds}
            onSelectionChange={setSelectedTagIds}
          />
        </View>

        {/* Transaction Type Switch */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">{t("new_transaction.type")}</Text>
          <View className="flex-row justify-between items-center p-4 rounded-lg bg-muted border border-border">
            <Text className={`text-base font-medium ${isIncome ? "text-green-600" : "text-muted-foreground"}`}>
              {t("new_transaction.income")}
            </Text>
            <Switch
              value={!isIncome}
              onValueChange={() => setIsIncome(!isIncome)}
            />
            <Text className={`text-base font-medium ${!isIncome ? "text-red-600" : "text-muted-foreground"}`}>
              {t("new_transaction.expense")}
            </Text>
          </View>
        </View>

        {/* Date Picker */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">{t("new_transaction.date")}</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="p-4 rounded-lg bg-muted border border-border"
          >
            <Text className="text-foreground text-base">{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}
      </ScrollView>

      {/* Footer Buttons */}
      <View className="p-6 border-t border-border bg-background">
        <View className="flex-row space-x-3">
          <Button
            variant="secondary"
            onPress={handleCancel}
            className="flex-1"
          >
            <ButtonText variant="secondary">Cancel</ButtonText>
          </Button>
          <Button
            disabled={!isValid() || loading}
            onPress={handleSave}
            className="flex-1"
          >
            <ButtonText>{loading ? "Saving..." : (transaction ? "Update" : "Save")}</ButtonText>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default AddTransaction
