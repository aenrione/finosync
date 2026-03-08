import { View, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import React, { useState, useCallback, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, router } from "expo-router"
import { useTranslation } from "react-i18next"

import AccountBalanceChart from "@/components/features/charts/account-balance-chart"
import { useTransactions } from "@/context/transactions.context"
import TransactionFilters from "@/components/transaction-filters"
import { filterTransactions } from "@/utils/transactionFilters"
import { useCategories } from "@/context/categories.context"
import TransactionList from "@/components/transaction-list"
import DeleteAlertWrapper from "@/components/delete-alert"
import { useAccounts } from "@/context/accounts.context"
import { showAmount } from "@/utils/currency"
import { fetchWithAuth } from "@/utils/api"
import { Text } from "@/components/ui/text"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"


export default function AccountDetailsScreen() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { accountsData: accounts, deleteAccount } = useAccounts()
  const {
    transactionsData: transactions,
    loading,
    hasMore,
    loadMore,
    refreshData
  } = useTransactions()
  const { categoriesData: categories } = useCategories()
  const isVisible = useStore((state) => state.isVisible)

  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [selectedPeriod, setSelectedPeriod] = useState("30D")
  const [accountData, setAccountData] = useState<any>(null)
  const [loadingAccount, setLoadingAccount] = useState(true)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoadingAccount(true)
    fetchWithAuth(`/accounts/${id}?time_range=${selectedPeriod}`)
      .then(res => res.json())
      .then(data => {
        setAccountData(data)
        setLoadingAccount(false)
      })
      .catch(() => setLoadingAccount(false))
  }, [id, selectedPeriod])

  const handleDeleteAccount = useCallback(async () => {
    if (!id) return
    try {
      console.log("Deleting account:", id.toString())
      await deleteAccount(id.toString())
      console.log("Account deleted, refreshing data")
      await refreshData()
    } catch (error) {
      console.error("Failed to delete account:", error)
    } finally {
      setShowDeleteAlert(false)
    }
  }, [id, deleteAccount, refreshData, router])

  const account = accounts.find(acc => acc.id.toString() === id)
  const accountTransactions = transactions.filter(t => t.account_id?.toString() === id)
  const filteredAccountTransactions = filterTransactions(accountTransactions, selectedFilter, categories, accounts)

  if (!account) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <Text className="text-foreground">Account not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refreshData()
    setRefreshing(false)
  }, [refreshData])

  // Use insights from backend response
  const insights = accountData?.insights || {
    total_income: 0,
    total_expenses: 0,
    transaction_count: 0,
    average_transaction: 0,
    top_category_name: "None",
    top_category_amount: 0
  }

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
          <Text className="text-lg font-bold text-foreground">{account.account_name}</Text>
          <Text className="text-sm text-muted-foreground">{account.account_type}</Text>
        </View>
        <TouchableOpacity className="w-8 h-8 rounded-full bg-muted justify-center items-center" onPress={() => {
          console.log("Delete icon pressed")
          setShowDeleteAlert(true)
        }}>
          <Icon name="Trash2" className="text-muted-foreground" size={18} />
        </TouchableOpacity>
      </View>
      {/* Always render the component, even if not open */}
      <DeleteAlertWrapper
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onDelete={handleDeleteAccount}
        title={t("delete_account.title")}
        errorMessage={t("delete_account.confirmation_message", { name: account.account_name })}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Account Balance Card */}
        <View className="px-5 mt-6">
          <View className="bg-background border border-border rounded-2xl p-6 shadow-sm border-l-4 border-l-primary">
            <View className="flex-row justify-between items-start mb-5">
              <View className="flex-row items-start flex-1">
                <View className="w-14 h-14 rounded-full bg-primary/10 justify-center items-center mr-4">
                  <Icon name="CreditCard" className="text-primary" size={28} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-muted-foreground mb-2">Current Balance</Text>
                  <View className="flex-row items-center">
                    <Text className="text-3xl font-bold text-foreground mr-3">
                      {isVisible ? showAmount(account.balance) : "------"}
                    </Text>
                    <TouchableOpacity className="p-1">
                      <Icon
                        name={isVisible ? "EyeOff" : "Eye"}
                        className="text-muted-foreground"
                        size={20}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View className="border-t border-border pt-4 space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">Account Number</Text>
                <Text className="text-sm font-semibold text-foreground">{account.id.toString()}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">Account Type</Text>
                <Text className="text-sm font-semibold text-foreground capitalize">{account.account_type}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">Last Transaction</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {accountTransactions.length > 0 ? new Date(accountTransactions[0].transaction_date).toLocaleDateString() : "No transactions"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Balance Chart */}
        <View className="px-5 mt-6">
          <AccountBalanceChart
            balanceHistory={accountData?.chart?.balance?.map((item: any) => ({
              date: item.label,
              balance: Number(item.balance ?? item.net ?? 0)
            })) || []}
            currency={account.currency}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            avgIncome={accountData?.chart?.avgIncome}
            avgExpenses={accountData?.chart?.avgExpenses}
            avgSavings={accountData?.chart?.avgSavings}
            avgBalance={accountData?.chart?.avgBalance}
            loading={loadingAccount}
          />
        </View>

        {/* Monthly Insights */}
        <View className="px-5 mt-6">
          <Text className="text-xl font-bold text-foreground mb-4">This Month's Insights</Text>

          <View className="flex-row flex-wrap -mx-3 mb-4">
            <View className="w-1/2 px-3 mb-4">
              <View className="bg-background border border-border rounded-2xl p-4 items-center">
                <View className="w-10 h-10 rounded-full bg-green-100 justify-center items-center mb-3">
                  <Icon name="TrendingUp" className="text-green-600" size={20} />
                </View>
                <Text className="text-lg font-bold text-foreground mb-1">
                  {showAmount(insights.total_income, accountData?.currency)}
                </Text>
                <Text className="text-sm text-muted-foreground text-center">Total Income</Text>
              </View>
            </View>

            <View className="w-1/2 px-3 mb-4">
              <View className="bg-background border border-border rounded-2xl p-4 items-center">
                <View className="w-10 h-10 rounded-full bg-red-100 justify-center items-center mb-3">
                  <Icon name="TrendingDown" className="text-red-600" size={20} />
                </View>
                <Text className="text-lg font-bold text-foreground mb-1">
                  {showAmount(insights.total_expenses, accountData?.currency)}
                </Text>
                <Text className="text-sm text-muted-foreground text-center">Total Expenses</Text>
              </View>
            </View>

            <View className="w-1/2 px-3 mb-4">
              <View className="bg-background border border-border rounded-2xl p-4 items-center">
                <View className="w-10 h-10 rounded-full bg-purple-100 justify-center items-center mb-3">
                  <Icon name="Calendar" className="text-purple-600" size={20} />
                </View>
                <Text className="text-lg font-bold text-foreground mb-1">{insights.transaction_count}</Text>
                <Text className="text-sm text-muted-foreground text-center">Transactions</Text>
              </View>
            </View>

            <View className="w-1/2 px-3 mb-4">
              <View className="bg-background border border-border rounded-2xl p-4 items-center">
                <View className="w-10 h-10 rounded-full bg-yellow-100 justify-center items-center mb-3">
                  <Icon name="DollarSign" className="text-yellow-600" size={20} />
                </View>
                <Text className="text-lg font-bold text-foreground mb-1">
                  {showAmount(insights.average_transaction, accountData?.currency)}
                </Text>
                <Text className="text-sm text-muted-foreground text-center">Avg Transaction</Text>
              </View>
            </View>
          </View>

          <View className="bg-background border border-border rounded-2xl p-4">
            <Text className="text-base font-semibold text-foreground mb-3">Top Spending Category</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted-foreground">{insights.top_category_name}</Text>
              <Text className="text-lg font-bold text-red-500">
                {showAmount(insights.top_category_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction Filters */}
        <View className="px-5 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-foreground">Recent Transactions</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity className="w-9 h-9 rounded-full bg-muted justify-center items-center">
                <Icon name="Search" className="text-muted-foreground" size={20} />
              </TouchableOpacity>
              <TouchableOpacity className="w-9 h-9 rounded-full bg-muted justify-center items-center">
                <Icon name="FileText" className="text-muted-foreground" size={20} />
              </TouchableOpacity>
              <TouchableOpacity className="w-9 h-9 rounded-full bg-muted justify-center items-center">
                <Icon name="Download" className="text-muted-foreground" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <TransactionFilters
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            showTypeFilters={true}
            showCategoryFilters={true}
            showAccountFilters={false}
            customFilters={["Food", "Transport", "Shopping"]}
          />
        </View>

        {/* Transactions List */}
        <View className="px-5 mb-6">
          <TransactionList
            transactions={filteredAccountTransactions}
            loading={loading}
            hasMore={hasMore}
            loadMore={loadMore}
            refreshData={refreshData}
            showLoadMore={true}
            emptyMessage={
              selectedFilter === "All"
                ? "No transactions for this account"
                : `No ${selectedFilter.toLowerCase()} transactions for this account`
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
