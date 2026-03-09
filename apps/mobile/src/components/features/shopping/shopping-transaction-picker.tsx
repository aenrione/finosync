import React, { useMemo, useState } from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TransactionList from "@/components/transaction-list";
import TransactionFilters from "@/components/transaction-filters";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useTransactions } from "@/context/transactions.context";
import { ShoppingItem } from "@/types/shopping";
import { Transaction } from "@/types/transaction";
import { filterTransactions } from "@/utils/transactionFilters";

interface ShoppingTransactionPickerProps {
  visible: boolean;
  item?: ShoppingItem | null;
  onClose: () => void;
  onSelect: (transaction: Transaction) => void;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const matchesSearch = (transaction: Transaction, searchTerm: string) => {
  const normalizedQuery = searchTerm.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const searchable = [
    transaction.description,
    transaction.category?.name,
    transaction.account_name,
    transaction.comment,
    transaction.holder_name,
    transaction.transaction_date,
    transaction.post_date,
    Math.abs(transaction.amount).toString(),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchable.includes(normalizedQuery);
};

const tokenize = (value?: string) =>
  (value || "")
    .toLowerCase()
    .split(/\W+/)
    .filter((token) => token.length > 2);

const scoreTransactionMatch = (
  transaction: Transaction,
  item?: ShoppingItem | null,
) => {
  if (!item) return 0;

  let score = 0;

  const itemAmount = Math.abs(item.price);
  const transactionAmount = Math.abs(transaction.amount);

  if (itemAmount > 0) {
    const amountDelta = Math.abs(transactionAmount - itemAmount);
    const ratio = amountDelta / itemAmount;

    if (amountDelta === 0) {
      score += 70;
    } else if (ratio <= 0.03) {
      score += 55;
    } else if (ratio <= 0.08) {
      score += 40;
    } else if (ratio <= 0.15) {
      score += 25;
    } else if (ratio <= 0.3) {
      score += 10;
    }
  }

  const transactionDate = transaction.transaction_date || transaction.post_date;
  if (item.purchase_date && transactionDate) {
    const itemDateValue = new Date(item.purchase_date).setHours(0, 0, 0, 0);
    const transactionDateValue = new Date(transactionDate).setHours(0, 0, 0, 0);
    const dateDiffDays =
      Math.abs(transactionDateValue - itemDateValue) / MS_PER_DAY;

    if (dateDiffDays === 0) {
      score += 25;
    } else if (dateDiffDays <= 2) {
      score += 18;
    } else if (dateDiffDays <= 7) {
      score += 10;
    } else if (dateDiffDays <= 14) {
      score += 4;
    }
  }

  const titleTokens = tokenize(item.title);
  const descriptionTokens = new Set(tokenize(transaction.description));
  const matchingTokens = titleTokens.filter((token) =>
    descriptionTokens.has(token),
  ).length;

  score += Math.min(matchingTokens * 8, 24);

  return score;
};

export function ShoppingTransactionPicker({
  visible,
  item,
  onClose,
  onSelect,
}: ShoppingTransactionPickerProps) {
  const {
    transactionsData,
    loading,
    refreshing,
    hasMore,
    loadMore,
    refreshData,
  } = useTransactions();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("expenses");

  const filteredTransactions = useMemo(() => {
    const expenseLikeTransactions = filterTransactions(
      transactionsData,
      selectedFilter,
    );

    return expenseLikeTransactions.filter((transaction) =>
      matchesSearch(transaction, searchTerm),
    );
  }, [searchTerm, selectedFilter, transactionsData]);

  const likelyMatches = useMemo(
    () =>
      [...filteredTransactions]
        .map((transaction) => ({
          transaction,
          score: scoreTransactionMatch(transaction, item),
        }))
        .filter(({ score }) => score >= 25)
        .sort((left, right) => right.score - left.score)
        .slice(0, 5)
        .map(({ transaction }) => transaction),
    [filteredTransactions, item],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background">
        <View className="h-14 flex-row items-center px-4 bg-background border-b border-border">
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Icon name="X" size={20} className="text-foreground" />
          </TouchableOpacity>
          <View className="flex-1 items-center px-3">
            <Text
              className="text-base font-semibold text-foreground"
              numberOfLines={1}
            >
              {item?.title ? `Link ${item.title}` : "Link transaction"}
            </Text>
          </View>
          <View className="w-5" />
        </View>

        <View className="flex-1 px-5 pt-5">
          <Text className="text-sm text-muted-foreground mb-4">
            Search your existing transactions and choose the one that matches
            this item.
          </Text>

          <View className="mb-4 flex-row items-center rounded-xl bg-card border border-border px-4">
            <Icon
              name="Search"
              size={18}
              className="text-muted-foreground mr-3"
            />
            <Input
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search by merchant, category, account, date, or amount"
              className="flex-1 h-12 px-0 bg-transparent"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchTerm.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchTerm("")} hitSlop={8}>
                <Icon name="X" size={18} className="text-muted-foreground" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TransactionFilters
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            showTypeFilters={true}
            showCategoryFilters={true}
            showAccountFilters={true}
          />

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">
              {filteredTransactions.length} match
              {filteredTransactions.length === 1 ? "" : "es"}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {likelyMatches.length > 0
                ? `${likelyMatches.length} likely matches`
                : "Expenses are the default view"}
            </Text>
          </View>

          {loading && transactionsData.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Spinner size="large" />
            </View>
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              loading={loading}
              hasMore={hasMore}
              loadMore={loadMore}
              refreshData={refreshData}
              refreshing={refreshing}
              showLoadMore={true}
              scrollEnabled={true}
              featuredTransactions={likelyMatches}
              featuredTitle="Likely matches"
              emptyMessage={
                searchTerm.trim()
                  ? "No transactions match that search"
                  : "No transactions available to link"
              }
              onTransactionPress={onSelect}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
