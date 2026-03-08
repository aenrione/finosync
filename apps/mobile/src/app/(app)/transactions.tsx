import { View, ScrollView, RefreshControl, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import React, { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { filterTransactions, getFilterStats } from "@/utils/transactionFilters"
import { useTransactions } from "@/context/transactions.context"
import TransactionFilters from "@/components/transaction-filters"
import { useCategories } from "@/context/categories.context"
import TransactionList from "@/components/transaction-list"
import { useAccounts } from "@/context/accounts.context"
import { showAmount } from "@/utils/currency"
import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"

export default function TransactionsScreen() {
  const { t } = useTranslation()
  const {
    transactionsData: transactions,
    loading,
    hasMore,
    loadMore,
    refreshData
  } = useTransactions()
  const { categoriesData: categories } = useCategories()
  const { accountsData: accounts } = useAccounts()

  const [selectedFilter, setSelectedFilter] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  const onRefresh = useCallback(async () => {
    await refreshData()
  }, [refreshData])

  // Filter transactions based on selected filter
  const filteredTransactions = filterTransactions(transactions, selectedFilter, categories, accounts)

  // Get filter statistics
  const filterStats = getFilterStats(transactions, selectedFilter)

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-background border-b border-border">
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground">All Transactions</Text>
          <Text className="text-sm text-muted-foreground">
            {selectedFilter === "All" ? transactions.length : filteredTransactions.length} transactions
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`w-10 h-10 rounded-full justify-center items-center ${
              showFilters ? "bg-primary" : "bg-muted"
            }`}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon
              name="ListFilter"
              className={showFilters ? "text-primary-foreground" : "text-muted-foreground"}
              size={20}
            />
          </TouchableOpacity>
          <View className="w-10 h-10 rounded-full bg-muted justify-center items-center">
            <Icon name="Search" className="text-muted-foreground" size={20} />
          </View>
          <View className="w-10 h-10 rounded-full bg-muted justify-center items-center">
            <Icon name="FileText" className="text-muted-foreground" size={20} />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {/* Filter Stats */}
        {selectedFilter !== "All" && (
          <View className="px-5 pt-4">
            <View className="bg-background border border-border rounded-xl p-4 mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                {selectedFilter} Summary
              </Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-muted-foreground">Count</Text>
                  <Text className="text-lg font-bold text-foreground">{filterStats.count}</Text>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground">Total</Text>
                  <Text className={`text-lg font-bold ${
                    filterStats.totalAmount >= 0 ? "text-green-600" : "text-red-500"
                  }`}>
                    {showAmount(Math.abs(filterStats.totalAmount))}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground">Average</Text>
                  <Text className={`text-lg font-bold ${
                    filterStats.averageAmount >= 0 ? "text-green-600" : "text-red-500"
                  }`}>
                    {showAmount(Math.abs(filterStats.averageAmount))}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Filters */}
        {showFilters && (
          <View className="px-5">
            <TransactionFilters
              selectedFilter={selectedFilter}
              onFilterChange={handleFilterChange}
              showTypeFilters={true}
              showCategoryFilters={true}
              showAccountFilters={true}
              customFilters={["Food", "Transport", "Shopping"]}
            />
          </View>
        )}

        {/* Transactions List */}
        <View className="px-5 py-4">
          <TransactionList
            transactions={filteredTransactions}
            loading={loading}
            hasMore={hasMore}
            loadMore={loadMore}
            refreshData={refreshData}
            showLoadMore={true}
            emptyMessage={
              selectedFilter === "All"
                ? "No transactions found"
                : `No ${selectedFilter.toLowerCase()} transactions found`
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
