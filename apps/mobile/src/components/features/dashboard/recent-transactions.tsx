import { View, Text, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import React from "react"

import TransactionList from "@/components/transaction-list"
import { Transaction } from "@/types/transaction"
import Icon from "@/components/ui/icon"


export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (!transactions || transactions.length === 0) {
    return null
  }

  return (
    <View className="px-5 mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-foreground">Recent Transactions</Text>
        <TouchableOpacity 
          onPress={() => router.push("/(app)/transactions")}
          className="flex-row items-center"
        >
          <Text className="text-sm font-medium text-primary mr-1">See All</Text>
          <Icon name="ChevronRight" className="text-primary" size={16} />
        </TouchableOpacity>
      </View>
      <TransactionList
        transactions={transactions}
        loading={false}
        hasMore={false}
        loadMore={undefined}
        refreshData={undefined}
        showLoadMore={false}
        maxItems={5}
        emptyMessage="No transactions yet"
      />
    </View>
  )
} 