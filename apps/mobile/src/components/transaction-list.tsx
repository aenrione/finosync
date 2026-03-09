import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  FlatList,
  RefreshControl,
} from "react-native";
import { useTranslation } from "@/components/_texts/transaction-list.text";
import React, { useCallback, useMemo } from "react";
import { router } from "expo-router";

import { Transaction } from "@/types/transaction";
import { IconName } from "@/types/icon";
import { showAmount, getCurrencyMeta } from "@/utils/currency";
import { useStore } from "@/utils/store";
import Icon from "@/components/ui/icon";

const groupTransactionsByDate = (
  transactions: Transaction[],
): { title: string; data: Transaction[] }[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<string, Transaction[]> = {};
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.transaction_date || a.post_date || 0).getTime();
    const dateB = new Date(b.transaction_date || b.post_date || 0).getTime();
    return dateB - dateA;
  });

  for (const tx of sortedTransactions) {
    const dateStr = tx.transaction_date || tx.post_date;
    if (!dateStr) continue;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    let label: string;
    if (date.getTime() === today.getTime()) {
      label = "Today";
    } else if (date.getTime() === yesterday.getTime()) {
      label = "Yesterday";
    } else {
      label = date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  }

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
};

const sortByDateDesc = (transactions: Transaction[]): Transaction[] =>
  [...transactions].sort((a, b) => {
    const dateA = new Date(a.transaction_date || a.post_date || 0).getTime();
    const dateB = new Date(b.transaction_date || b.post_date || 0).getTime();
    return dateB - dateA;
  });

const getCategoryIcon = (categoryName: string): IconName => {
  const categoryMap: Record<string, IconName> = {
    "Food & Dining": "Utensils",
    Transportation: "Car",
    Shopping: "ShoppingBag",
    Entertainment: "Gamepad2",
    Healthcare: "Heart",
    Education: "BookOpen",
    Travel: "Plane",
    Utilities: "Zap",
    Insurance: "Shield",
    Investment: "TrendingUp",
    Salary: "DollarSign",
    Freelance: "Briefcase",
    Business: "Building",
    Other: "Circle",
  };

  return categoryMap[categoryName] || "Circle";
};

const getCategoryColor = (
  categoryName: string,
): { bg: string; text: string } => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    "Food & Dining": { bg: "bg-destructive/10", text: "text-destructive" },
    Transportation: { bg: "bg-primary/10", text: "text-primary" },
    Shopping: { bg: "bg-investment/10", text: "text-investment" },
    Entertainment: { bg: "bg-crypto/10", text: "text-crypto" },
    Healthcare: { bg: "bg-income/10", text: "text-income" },
    Education: { bg: "bg-info/10", text: "text-info" },
    Travel: { bg: "bg-savings/10", text: "text-savings" },
    Utilities: { bg: "bg-crypto/10", text: "text-crypto" },
    Insurance: { bg: "bg-income/10", text: "text-income" },
    Investment: { bg: "bg-investment/10", text: "text-investment" },
    Salary: { bg: "bg-income/10", text: "text-income" },
    Freelance: { bg: "bg-primary/10", text: "text-primary" },
    Business: { bg: "bg-investment/10", text: "text-investment" },
    Other: { bg: "bg-muted", text: "text-muted-foreground" },
  };

  return (
    colorMap[categoryName] || { bg: "bg-muted", text: "text-muted-foreground" }
  );
};

function formatTxDate(tx: Transaction): string {
  const dateStr = tx.transaction_date || tx.post_date;
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const txDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (txDay.getTime() === today.getTime()) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (txDay.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
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
  onTransactionPress?: (transaction: Transaction) => void;
  scrollEnabled?: boolean;
  featuredTransactions?: Transaction[];
  featuredTitle?: string;
  groupByDate?: boolean;
}

export default function TransactionList({
  transactions,
  refreshing = false,
  scrollEnabled = false,
  featuredTransactions = [],
  featuredTitle = "Likely matches",
  groupByDate = true,
  ...props
}: TransactionListProps) {
  const text = useTranslation();
  const isVisible = useStore((state) => state.isVisible);

  const displayTransactions = props.maxItems
    ? transactions.slice(0, props.maxItems)
    : transactions;

  const renderTransaction = useCallback(
    ({ item: transaction }: { item: Transaction }) => {
      const categoryName = transaction.category?.name || "Other";
      const iconName = getCategoryIcon(categoryName);
      const categoryColor = getCategoryColor(categoryName);
      const isExpense =
        transaction.transaction_type === "debit" || transaction.amount < 0;
      const { symbol } = getCurrencyMeta(transaction.currency);
      const dateLabel = formatTxDate(transaction);

      const handlePress = () => {
        if (props.onTransactionPress) {
          props.onTransactionPress(transaction);
        } else {
          router.push(`/(app)/transaction/${transaction.id}`);
        }
      };

      const displayAmount = isVisible
        ? `${isExpense ? "-" : "+"}${symbol} ${showAmount(Math.abs(transaction.amount))}`
        : "••••••";

      return (
        <TouchableOpacity
          onPress={handlePress}
          className="bg-card rounded-2xl px-4 py-3.5 border border-border mb-2.5"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-3">
              <View
                className={`w-11 h-11 rounded-2xl justify-center items-center mr-3 ${categoryColor.bg}`}
              >
                <Icon
                  name={iconName}
                  size={20}
                  className={categoryColor.text}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold text-foreground mb-0.5 tracking-tight"
                  numberOfLines={1}
                >
                  {transaction.description || text.noDescription}
                </Text>
                <Text
                  className="text-xs text-muted-foreground"
                  numberOfLines={1}
                >
                  {categoryName}
                  {transaction.account_name
                    ? ` • ${transaction.account_name}`
                    : ""}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text
                className={`text-base font-mono font-extrabold tracking-tight ${isExpense ? "text-expense" : "text-income"}`}
              >
                {displayAmount}
              </Text>
              <Text className="text-xs text-muted-foreground font-semibold">
                {dateLabel}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [isVisible, props.onTransactionPress],
  );

  const sorted = useMemo(
    () => sortByDateDesc(displayTransactions),
    [displayTransactions],
  );

  const sections = useMemo(() => {
    const featuredIds = new Set(
      featuredTransactions.map((transaction) => transaction.id),
    );
    const remainingTransactions = displayTransactions.filter(
      (transaction) => !featuredIds.has(transaction.id),
    );
    const groupedSections = groupTransactionsByDate(remainingTransactions);

    if (featuredTransactions.length === 0) {
      return groupedSections;
    }

    return [
      { title: featuredTitle, data: featuredTransactions },
      ...groupedSections,
    ];
  }, [displayTransactions, featuredTitle, featuredTransactions]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <Text className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mt-4 mb-2">
        {section.title}
      </Text>
    ),
    [],
  );

  const emptyComponent = (
    <View className="items-center py-8">
      <Icon name="Receipt" className="text-muted-foreground mb-2" size={48} />
      <Text className="text-muted-foreground text-center">
        {props.emptyMessage}
      </Text>
    </View>
  );

  if (transactions.length === 0) {
    return emptyComponent;
  }

  // Flat list mode (no date grouping)
  if (!groupByDate) {
    return (
      <View>
        <FlatList
          data={sorted}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
          ListEmptyComponent={emptyComponent}
        />

        {props.showLoadMore && props.hasMore && (
          <TouchableOpacity
            onPress={props.loadMore}
            disabled={props.loading}
            className="bg-card rounded-xl p-4 mt-3 items-center border border-border"
          >
            {props.loading ? (
              <View className="flex-row items-center">
                <Icon
                  name="Loader"
                  className="text-muted-foreground mr-2 animate-spin"
                  size={20}
                />
                <Text className="text-muted-foreground">{text.loading}</Text>
              </View>
            ) : (
              <Text className="text-primary font-semibold">
                {text.loadMore}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Section list mode (grouped by date) — used by other screens
  return (
    <View>
      <SectionList
        sections={sections}
        renderItem={renderTransaction}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        stickySectionHeadersEnabled={false}
        refreshControl={
          props.refreshData ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={props.refreshData}
            />
          ) : undefined
        }
        ListEmptyComponent={emptyComponent}
      />

      {props.showLoadMore && props.hasMore && (
        <TouchableOpacity
          onPress={props.loadMore}
          disabled={props.loading}
          className="bg-card rounded-xl p-4 mt-4 items-center"
        >
          {props.loading ? (
            <View className="flex-row items-center">
              <Icon
                name="Loader"
                className="text-muted-foreground mr-2 animate-spin"
                size={20}
              />
              <Text className="text-muted-foreground">{text.loading}</Text>
            </View>
          ) : (
            <Text className="text-primary font-semibold">{text.loadMore}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
