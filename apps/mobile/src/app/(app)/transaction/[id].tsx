import { View, ScrollView, TouchableOpacity, Share, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, router } from "expo-router"
import { useTranslation } from "react-i18next"
import React, { useState } from "react"

import { useTransactions } from "@/context/transactions.context"
import { useCategories } from "@/context/categories.context"
import { useAccounts } from "@/context/accounts.context"
import { showAmount } from "@/utils/currency"
import { Text } from "@/components/ui/text"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"

// Currency configurations
const currencyConfig = {
  USD: { symbol: "$", flag: "US", name: "US Dollar" },
  EUR: { symbol: "E", flag: "EU", name: "Euro" },
  GBP: { symbol: "P", flag: "GB", name: "British Pound" },
  CLP: { symbol: "$", flag: "CL", name: "Chilean Peso" }
}

// Status configurations
const statusConfig = {
  completed: {
    icon: "CircleCheck",
    label: "Completed"
  },
  pending: {
    icon: "Clock",
    label: "Pending"
  },
  failed: {
    icon: "XCircle",
    label: "Failed"
  },
  cancelled: {
    icon: "AlertCircle",
    label: "Cancelled"
  }
}

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { transactionsData: transactions } = useTransactions()
  const { categoriesData: categories } = useCategories()
  const { accountsData: accounts } = useAccounts()
  const isVisible = useStore((state) => state.isVisible)

  const [showFullDescription, setShowFullDescription] = useState(false)

  const transaction = transactions.find(t => t.id.toString() === id)
  const category = transaction ? transaction.category : null
  const account = transaction ? accounts.find(a => a.id === transaction.account_id) : null

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-10">
          <Icon name="CircleAlert" className="text-red-500 mb-4" size={48} />
          <Text className="text-2xl font-bold text-foreground mb-2">Transaction Not Found</Text>
          <Text className="text-base text-muted-foreground text-center mb-6">
            The requested transaction could not be found.
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3"
            onPress={() => router.back()}
          >
            <Text className="text-base font-semibold text-primary-foreground">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const formatAmount = (amount: number, currency: string) => {
    const config = currencyConfig[currency as keyof typeof currencyConfig]
    return `${config?.symbol}${showAmount(Math.abs(amount))}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const handleShare = async () => {
    try {
      const message = `Transaction Details\n\n${transaction.description || "Transaction"}\nAmount: ${transaction.amount > 0 ? "+" : ""}${formatAmount(transaction.amount, account?.currency || "USD")}\nDate: ${formatDateShort(transaction.transaction_date)}\nAccount: ${account?.account_name || "Unknown"}`

      await Share.share({
        message,
        title: "Transaction Details"
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const handleDownloadReceipt = () => {
    Alert.alert("Download Receipt", "Receipt download functionality would be implemented here.")
  }

  const handleEditTransaction = () => {
    Alert.alert("Edit Transaction", "Transaction editing functionality would be implemented here.")
  }

  const handleDeleteTransaction = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
          // Delete logic would go here
          router.back()
        }}
      ]
    )
  }

  const handleToggleIgnore = () => {
    Alert.alert(
      "Ignore Transaction",
      "This transaction will be ignored in your spending calculations.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => {
          // Toggle ignore logic would go here
        }}
      ]
    )
  }

  const config = currencyConfig[account?.currency as keyof typeof currencyConfig] || currencyConfig.USD
  const statusInfo = statusConfig.completed // Default to completed for now
  const isIncome = transaction.amount > 0
  const transactionAmount = isVisible ? transaction.amount : "------"

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-background border-b border-border">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-muted justify-center items-center"
          onPress={() => router.back()}
        >
          <Icon name="ArrowLeft" className="text-foreground" size={24} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-foreground">Transaction Details</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-muted justify-center items-center"
            onPress={handleShare}
          >
            <Icon name="Share2" className="text-muted-foreground" size={20} />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-muted justify-center items-center">
            <Icon name="Ellipsis" className="text-muted-foreground" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Transaction Card */}
        <View className="px-5 mt-6">
          <View className={`bg-background border border-border rounded-2xl p-6 shadow-sm border-l-4 ${
            isIncome ? "border-l-green-500" : "border-l-red-500"
          }`}>
            <View className="flex-row justify-between items-start mb-5">
              <View className="flex-row items-start flex-1">
                <View className={`w-14 h-14 rounded-full justify-center items-center mr-4 ${
                  isIncome ? "bg-green-100" : "bg-red-100"
                }`}>
                  <Icon
                    name={isIncome ? "TrendingUp" : "TrendingDown"}
                    className={isIncome ? "text-green-600" : "text-red-500"}
                    size={28}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-foreground mb-2">
                    {transaction.description || "Transaction"}
                  </Text>
                  <Text className="text-base text-muted-foreground">
                    {category?.name || "Uncategorized"}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className={`text-3xl font-bold mb-2 ${
                  isIncome ? "text-green-600" : "text-red-500"
                }`}>
                  {isIncome ? "+" : ""}{transactionAmount}
                </Text>
                <View className="flex-row items-center bg-muted rounded-xl px-3 py-2">
                  <Text className="text-base mr-2">{config.flag}</Text>
                  <Text className="text-sm font-semibold text-foreground">{account?.currency || "USD"}</Text>
                </View>
              </View>
            </View>

            {/* Status and Date */}
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center rounded-full px-3 py-2 bg-green-100">
                <Icon name={statusInfo.icon as any} className="text-green-600" size={16} />
                <Text className="text-sm font-semibold ml-2 text-green-600">
                  {statusInfo.label}
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground">
                {formatDate(transaction.transaction_date)}
              </Text>
            </View>

            {/* Description */}
            {transaction.description && (
              <View className="border-t border-border pt-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Description</Text>
                <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                  <Text className="text-base text-muted-foreground leading-6" numberOfLines={showFullDescription ? undefined : 2}>
                    {transaction.description}
                  </Text>
                  {transaction.description.length > 100 && (
                    <Text className="text-sm text-primary font-semibold mt-2">
                      {showFullDescription ? "Show less" : "Show more"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 mt-6">
          <View className="flex-row justify-between">
            <TouchableOpacity className="items-center flex-1" onPress={handleEditTransaction}>
              <View className="w-14 h-14 rounded-full bg-blue-100 justify-center items-center mb-2">
                <Icon name="Pencil" className="text-blue-600" size={20} />
              </View>
              <Text className="text-sm font-semibold text-foreground text-center">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center flex-1" onPress={handleDownloadReceipt}>
              <View className="w-14 h-14 rounded-full bg-green-100 justify-center items-center mb-2">
                <Icon name="Receipt" className="text-green-600" size={20} />
              </View>
              <Text className="text-sm font-semibold text-foreground text-center">Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center flex-1" onPress={handleToggleIgnore}>
              <View className="w-14 h-14 rounded-full bg-yellow-100 justify-center items-center mb-2">
                <Icon name="Eye" className="text-yellow-600" size={20} />
              </View>
              <Text className="text-sm font-semibold text-foreground text-center">Ignore</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center flex-1" onPress={handleDeleteTransaction}>
              <View className="w-14 h-14 rounded-full bg-red-100 justify-center items-center mb-2">
                <Icon name="Trash2" className="text-red-500" size={20} />
              </View>
              <Text className="text-sm font-semibold text-foreground text-center">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction Details */}
        <View className="px-5 mt-6">
          <Text className="text-xl font-bold text-foreground mb-4">Transaction Information</Text>
          <View className="bg-background border border-border rounded-2xl p-5">
            <View className="flex-row items-center py-3 border-b border-border">
              <View className="w-8 h-8 rounded-full bg-muted justify-center items-center mr-4">
                <Icon name="Hash" className="text-muted-foreground" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">Transaction ID</Text>
                <Text className="text-base font-semibold text-foreground">{transaction.id}</Text>
              </View>
            </View>

            <View className="flex-row items-center py-3 border-b border-border">
              <View className="w-8 h-8 rounded-full bg-muted justify-center items-center mr-4">
                <Icon name="FileText" className="text-muted-foreground" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">Transaction Type</Text>
                <Text className="text-base font-semibold text-foreground">
                  {isIncome ? "Income" : "Expense"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center py-3 border-b border-border">
              <View className="w-8 h-8 rounded-full bg-muted justify-center items-center mr-4">
                <Icon name="Calendar" className="text-muted-foreground" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">Transaction Date</Text>
                <Text className="text-base font-semibold text-foreground">
                  {formatDateShort(transaction.transaction_date)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View className="px-5 mt-6">
          <Text className="text-xl font-bold text-foreground mb-4">Account Information</Text>
          <View className="bg-background border border-border rounded-2xl p-5">
            <View className="flex-row items-center py-3 border-b border-border">
              <View className="w-8 h-8 rounded-full bg-muted justify-center items-center mr-4">
                <Icon name="CreditCard" className="text-muted-foreground" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">Account Name</Text>
                <Text className="text-base font-semibold text-foreground">
                  {account?.account_name || "Unknown Account"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center py-3 border-b border-border">
              <View className="w-8 h-8 rounded-full bg-muted justify-center items-center mr-4">
                <Icon name="Hash" className="text-muted-foreground" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">Account Number</Text>
                <Text className="text-base font-semibold text-foreground">
                  ****{account?.id.toString().slice(-4) || "****"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center py-3">
              <View className="w-8 h-8 rounded-full bg-muted justify-center items-center mr-4">
                <Icon name="Building" className="text-muted-foreground" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">Account Type</Text>
                <Text className="text-base font-semibold text-foreground capitalize">
                  {account?.account_type || "Unknown"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
