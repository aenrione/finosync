import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import React, { useEffect, useState } from "react"
import { useTranslation } from "@/locale/app/add-transaction.text"
import {
  DollarSign,
  FileText,
  MessageSquare,
  Tag,
} from "lucide-react-native"

import { useTransactions } from "@/context/transactions.context"
import { useCategories } from "@/context/categories.context"
import { useDashboard } from "@/context/dashboard.context"
import { FormField } from "@/components/ui/form-field"
import { MoneyInput } from "@/components/ui/money-input"
import { FormSelect } from "@/components/ui/form-select"
import { FormDatePicker } from "@/components/ui/form-date-picker"
import { FormToggle } from "@/components/ui/form-toggle"
import { FormSection } from "@/components/ui/form-section"
import ScreenHeader from "@/components/screen-header"
import { Button, ButtonText } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { useStore } from "@/utils/store"
import { TagSelector } from "@/components/features/tags/tag-selector"
import { tagService } from "@/services/tag.service"
import { colors } from "@/lib/colors"

const AddTransaction = () => {
  const text = useTranslation()
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
  const [date, setDate] = useState(new Date())
  const [amount, setAmount] = useState("")
  const [comment, setComment] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

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
      setDescription(transaction.description || "")
      setSelectedCategory(transaction.transaction_category_id || null)
      setSelectedAccount(transaction.account_id || null)
      setAmount(Math.abs(transaction.amount).toString())
      setIsIncome(transaction.amount >= 0)
      setDate(new Date(transaction.transaction_date))
      setComment(transaction.comment || "")
      setSelectedTagIds(transaction.tags?.map((t) => t.id) || [])
    } else {
      if (accountId && localAccounts.length > 0) {
        const accountIdNum = parseInt(accountId)
        const targetAccount = localAccounts.find(acc => acc.id === accountIdNum)
        if (targetAccount) {
          setSelectedAccount(targetAccount.id as number)
        } else {
          setSelectedAccount(localAccounts[0].id as number)
        }
      } else if (localAccounts.length > 0) {
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
        await updateTransaction(transaction.id, transactionData)
        if (selectedTagIds.length > 0) {
          await tagService.setTransactionTags(transaction.id, selectedTagIds)
        }
        Alert.alert("Success", "Transaction updated successfully")
      } else {
        const created = await createTransaction(transactionData)
        if (selectedTagIds.length > 0 && created?.id) {
          await tagService.setTransactionTags(created.id, selectedTagIds)
        }
        Alert.alert("Success", "Transaction created successfully")
      }

      setCurrentTransaction(undefined)
      router.back()
    } catch (error) {
      console.error("Error saving transaction:", error)
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save transaction")
    } finally {
      setLoading(false)
    }
  }

  if (localAccounts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title={transaction ? text.titleEdit : text.titleNew} variant="back" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-foreground text-lg text-center mb-4">
            You need to create a local account first to add manual transactions.
          </Text>
          <Button onPress={() => router.push("/(app)/add-account")}>
            <ButtonText>Create Local Account</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  const accountOptions = localAccounts.map((account) => ({
    value: account.id as number,
    label: account.account_name,
  }))

  const categoryOptions = [
    { value: null, label: "No Category" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ]

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title={transaction ? text.titleEdit : text.titleNew} variant="back" />

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

          {/* Amount & Type */}
          <FormSection title="Amount">
            <MoneyInput
              label={text.amount}
              value={amount}
              placeholder={text.amountPlaceholder}
              onChangeValue={setAmount}
              icon={DollarSign}
              required
            />

            <FormToggle
              label={text.type}
              value={isIncome}
              onValueChange={setIsIncome}
              variant="segment"
              leftLabel={text.income}
              rightLabel={text.expense}
              leftColor={colors.income}
              rightColor={colors.expense}
              containerClassName="mb-0"
            />
          </FormSection>

          {/* Details */}
          <FormSection title="Details">
            <FormField
              label={text.desc}
              value={description}
              placeholder={text.descPlaceholder}
              onChangeText={setDescription}
              icon={FileText}
              required
            />

            <FormField
              label={text.comment}
              value={comment}
              placeholder="Add a comment..."
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              icon={MessageSquare}
            />
          </FormSection>

          {/* Classification */}
          <FormSection title="Classification">
            <FormSelect
              label={text.account}
              options={accountOptions}
              value={selectedAccount}
              onValueChange={(v) => setSelectedAccount(v as number | null)}
              required
            />

            <FormSelect
              label={text.category}
              options={categoryOptions}
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v as number | null)}
            />

            <View className="mb-5">
              <Text className="text-sm font-medium text-muted-foreground mb-2">
                Tags
              </Text>
              <TagSelector
                selectedTagIds={selectedTagIds}
                onSelectionChange={setSelectedTagIds}
              />
            </View>
          </FormSection>

          {/* Date */}
          <FormSection title="Date">
            <FormDatePicker
              label={text.date}
              value={date}
              onChange={setDate}
              maximumDate={new Date()}
              containerClassName="mb-0"
            />
          </FormSection>

          <View className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View className="px-5 py-4 border-t border-border bg-background">
        <Button
          disabled={!isValid() || loading}
          onPress={handleSave}
          className="w-full"
          size="lg"
        >
          <ButtonText size="lg">
            {loading ? "Saving..." : (transaction ? "Update" : "Save")}
          </ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default AddTransaction
