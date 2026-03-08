import { View, Text, TouchableOpacity, FlatList, RefreshControl } from "react-native"
import { useTranslation } from "react-i18next"
import React, { useCallback } from "react"
import { router } from "expo-router"

import { Transaction } from "@/types/transaction"
import { showAmount } from "@/utils/currency"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"

const currencyConfig = {
  USD: { symbol: "$", flag: "🇺🇸" },
  EUR: { symbol: "€", flag: "🇪🇺" },
  GBP: { symbol: "£", flag: "🇬🇧" },
  CLP: { symbol: "$", flag: "🇨🇱" },
}

const getCategoryIcon = (categoryName: string) => {
  const categoryMap: Record<string, string> = {
    "Food & Dining": "Utensils",
    "Transportation": "Car",
    "Shopping": "ShoppingBag",
    "Entertainment": "Gamepad2",
    "Healthcare": "Heart",
    "Education": "BookOpen",
    "Travel": "Plane",
    "Utilities": "Zap",
    "Insurance": "Shield",
    "Investment": "TrendingUp",
    "Salary": "DollarSign",
    "Freelance": "Briefcase",
    "Business": "Building",
    "Other": "Circle",
  }

  return categoryMap[categoryName] || "Circle"
}

const getCategoryColor = (categoryName: string): { bg: string; text: string } => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    "Food & Dining": { bg: "bg-destructive/10", text: "text-destructive" },
    "Transportation": { bg: "bg-primary/10", text: "text-primary" },
    "Shopping": { bg: "bg-investment/10", text: "text-investment" },
    "Entertainment": { bg: "bg-crypto/10", text: "text-crypto" },
    "Healthcare": { bg: "bg-pink-500/10", text: "text-pink-500" },
    "Education": { bg: "bg-success/10", text: "text-income" },
    "Travel": { bg: "bg-savings/10", text: "text-savings" },
    "Utilities": { bg: "bg-orange-500/10", text: "text-orange-500" },
    "Insurance": { bg: "bg-lime-500/10", text: "text-lime-500" },
    "Investment": { bg: "bg-success/10", text: "text-income" },
    "Salary": { bg: "bg-success/10", text: "text-income" },
    "Freelance": { bg: "bg-primary/10", text: "text-primary" },
    "Business": { bg: "bg-investment/10", text: "text-investment" },
    "Other": { bg: "bg-muted", text: "text-muted-foreground" },
  }

  return colorMap[categoryName] || { bg: "bg-muted", text: "text-muted-foreground" }
}

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
  refreshData?: () => void;
  refreshing?: boolean;
  showLoadMore?: boolean;
  maxItems?: number;
  emptyMessage?: string;
  onTransactionPress?: (transaction: any) => void;
}

export default function TransactionList({ transactions, refreshing=false, ...props }: TransactionListProps) {
  const { t } = useTranslation()
  const isVisible = useStore((state) => state.isVisible)

  const displayTransactions = props.maxItems ? transactions.slice(0, props.maxItems) : transactions

  const renderTransaction = useCallback(({ item: transaction }: { item: any }) => {
    const categoryName = transaction.category?.name || "Other"
    const iconName = getCategoryIcon(categoryName)
    const categoryColor = getCategoryColor(categoryName)
    const isExpense = transaction.amount < 0

    const handlePress = () => {
      if (props.onTransactionPress) {
        props.onTransactionPress(transaction)
      } else {
        router.push(`/(app)/transaction/${transaction.id}`)
      }
    }

    return (
      <TouchableOpacity
        onPress={handlePress}
        className="bg-background border border-border rounded-2xl p-4 mb-3 shadow-sm"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className={`w-12 h-12 rounded-full justify-center items-center mr-3 ${categoryColor.bg}`}>
              <Icon name={iconName as any} size={24} className={categoryColor.text} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground mb-1">
                {transaction.description || t("noDescription")}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {categoryName} • {new Date(transaction.transaction_date || transaction.post_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className={`text-lg font-bold ${isExpense ? "text-expense" : "text-income"}`}>
              {isVisible ? `${showAmount(transaction.amount)}` : "••••••"}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {transaction.currency}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }, [isVisible, props.onTransactionPress])

  if (transactions.length === 0) {
    return (
      <View className="items-center py-8">
        <Icon name="Receipt" className="text-muted-foreground mb-2" size={48} />
        <Text className="text-muted-foreground text-center">{props.emptyMessage}</Text>
      </View>
    )
  }

  return (
    <View>
      <FlatList
        data={displayTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        refreshControl={
          props.refreshData ? (
            <RefreshControl
              refreshing={props.refreshing}
              onRefresh={props.refreshData}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <View className="items-center py-8">
            <Icon name="Receipt" className="text-muted-foreground mb-2" size={48} />
            <Text className="text-muted-foreground text-center">{props.emptyMessage}</Text>
          </View>
        }
      />

      {props.showLoadMore && props.hasMore && (
        <TouchableOpacity
          onPress={props.loadMore}
          disabled={props.loading}
          className="bg-background border border-border rounded-2xl p-4 mt-4 items-center"
        >
          {props.loading ? (
            <View className="flex-row items-center">
              <Icon name="Loader" className="text-muted-foreground mr-2 animate-spin" size={20} />
              <Text className="text-muted-foreground">{t("loading")}</Text>
            </View>
          ) : (
            <Text className="text-primary font-semibold">{t("loadMoreTransactions")}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  )
}
