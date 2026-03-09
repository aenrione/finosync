import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useState } from "react";
import { router } from "expo-router";

import TransactionFilters from "@/components/transaction-filters";
import { useTransactions } from "@/context/transactions.context";
import { filterTransactions } from "@/utils/transactionFilters";
import { useCategories } from "@/context/categories.context";
import TransactionList from "@/components/transaction-list";
import { useAccounts } from "@/context/accounts.context";
import ScreenHeader from "@/components/screen-header";
import { showAmount } from "@/utils/currency";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import Icon from "@/components/ui/icon";

export default function TransactionsScreen() {
  const {
    transactionsData: transactions,
    loading,
    hasMore,
    loadMore,
    refreshData,
  } = useTransactions();
  const { categoriesData: categories } = useCategories();
  const { accountsData: accounts } = useAccounts();

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  // Filter transactions based on selected filter
  const filteredTransactions = filterTransactions(
    transactions,
    selectedFilter,
    categories,
    accounts,
  );

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const visibleTransactions = filteredTransactions.filter((transaction) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    return [
      transaction.description,
      transaction.comment,
      transaction.category?.name,
      transaction.account_name,
      transaction.holder_name,
      transaction.holder_institution,
      transaction.currency,
    ].some((value) => value?.toLowerCase().includes(normalizedSearchTerm));
  });

  const totalAmount = visibleTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  const filterStats = {
    count: visibleTransactions.length,
    totalAmount,
    averageAmount:
      visibleTransactions.length > 0
        ? totalAmount / visibleTransactions.length
        : 0,
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const toggleSearch = () => {
    setSearchVisible((current) => {
      if (current) {
        setSearchTerm("");
      }

      return !current;
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        variant="drawer"
        title="Transactions"
        rightActions={[
          { icon: "ListFilter", onPress: () => setShowFilters(!showFilters) },
          { icon: "Search", onPress: toggleSearch },
          {
            icon: "Plus",
            onPress: () => router.push("/(app)/add-transaction"),
          },
        ]}
      />

      {searchVisible && (
        <View className="px-5 pt-4">
          <View className="flex-row items-center bg-muted rounded-xl px-4 py-3">
            <Icon
              name="Search"
              className="text-muted-foreground mr-3"
              size={20}
            />
            <Input
              className="flex-1 border-0"
              placeholder="Search transactions..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoFocus
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <Icon name="X" className="text-muted-foreground" size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {/* Filter Stats */}
        {selectedFilter.toLowerCase() !== "all" && (
          <View className="px-5 pt-4">
            <View className="bg-card rounded-xl p-4 mb-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-2">
                {selectedFilter} Summary
              </Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-muted-foreground">Count</Text>
                  <Text className="text-lg font-mono font-semibold text-foreground">
                    {filterStats.count}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground">Total</Text>
                  <Text
                    className={`text-lg font-mono font-semibold ${
                      filterStats.totalAmount >= 0
                        ? "text-income"
                        : "text-expense"
                    }`}
                  >
                    {showAmount(Math.abs(filterStats.totalAmount))}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground">Average</Text>
                  <Text
                    className={`text-lg font-mono font-semibold ${
                      filterStats.averageAmount >= 0
                        ? "text-income"
                        : "text-expense"
                    }`}
                  >
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
            transactions={visibleTransactions}
            loading={loading}
            hasMore={hasMore}
            loadMore={loadMore}
            refreshData={refreshData}
            showLoadMore={true}
            emptyMessage={
              normalizedSearchTerm
                ? "No transactions match your search"
                : selectedFilter.toLowerCase() === "all"
                  ? "No transactions found"
                  : `No ${selectedFilter.toLowerCase()} transactions found`
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
