import { View, ScrollView, TouchableOpacity, Share, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import React, { useState } from "react";

import ScreenHeader from "@/components/screen-header";
import { useTransactions } from "@/context/transactions.context";
import { useCategories } from "@/context/categories.context";
import { useAccounts } from "@/context/accounts.context";
import { showAmount, getCurrencyMeta } from "@/utils/currency";
import { Text } from "@/components/ui/text";
import { useStore } from "@/utils/store";
import Icon from "@/components/ui/icon";

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { transactionsData: transactions, deleteTransaction } =
    useTransactions();
  const { categoriesData: categories } = useCategories();
  const { accountsData: accounts } = useAccounts();
  const isVisible = useStore((state) => state.isVisible);
  const setCurrentTransaction = useStore(
    (state) => state.setCurrentTransaction,
  );

  const [showFullDescription, setShowFullDescription] = useState(false);

  const transaction = transactions.find((t) => t.id.toString() === id);
  const category = transaction ? transaction.category : null;
  const account = transaction
    ? accounts.find((a) => a.id === transaction.account_id)
    : null;

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-10">
          <Icon
            name="CircleAlert"
            className="text-destructive mb-4"
            size={48}
          />
          <Text className="text-2xl font-bold text-foreground mb-2">
            Transaction Not Found
          </Text>
          <Text className="text-base text-muted-foreground text-center mb-6">
            The requested transaction could not be found.
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3"
            onPress={() => router.back()}
          >
            <Text className="text-base font-semibold text-primary-foreground">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const config = getCurrencyMeta(account?.currency || transaction.currency);
  const isIncome = transaction.amount > 0;
  const isIgnored = transaction.ignore;

  const formatAmount = (amount: number) => {
    return `${config.symbol} ${showAmount(Math.abs(amount))}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleShare = async () => {
    try {
      const message = `Transaction Details\n\n${transaction.description || "Transaction"}\nAmount: ${transaction.amount > 0 ? "+" : ""}${formatAmount(transaction.amount)}\nDate: ${formatDateShort(transaction.transaction_date)}\nAccount: ${account?.account_name || "Unknown"}`;

      await Share.share({
        message,
        title: "Transaction Details",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleEditTransaction = () => {
    if (!account?.editable) {
      Alert.alert(
        "Read-only transaction",
        "Only manual transactions can be edited right now.",
      );
      return;
    }

    setCurrentTransaction(transaction);
  };

  const handleDeleteTransaction = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
              router.back();
            } catch (error) {
              Alert.alert(
                "Delete failed",
                error instanceof Error
                  ? error.message
                  : "Could not delete transaction.",
              );
            }
          },
        },
      ],
    );
  };

  const handleToggleIgnore = () => {
    Alert.alert(
      isIgnored ? "Include Transaction" : "Exclude Transaction",
      isIgnored
        ? "This transaction will be included in your spending calculations again."
        : "This transaction will be excluded from your spending calculations.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            // Toggle ignore logic
          },
        },
      ],
    );
  };

  const handleViewAccount = () => {
    if (account) {
      router.push(`/(app)/account/${account.id}`);
    }
  };

  const displayAmount = isVisible
    ? `${isIncome ? "+" : "-"}${formatAmount(transaction.amount)}`
    : "------";

  const accountTypeLabel = account?.account_type
    ? account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)
    : "Unknown";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        title="Transaction"
        variant="back"
        rightActions={[{ icon: "Share2", onPress: handleShare }]}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View className="px-5 mt-4">
          <View className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            {/* Top: Icon + Name + Amount */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-row items-start flex-1 mr-3">
                <View
                  className={`w-12 h-12 rounded-2xl justify-center items-center mr-3 ${
                    isIncome ? "bg-income/10" : "bg-expense/10"
                  }`}
                >
                  <Icon
                    name={isIncome ? "ArrowDownLeft" : "ArrowUpRight"}
                    className={isIncome ? "text-income" : "text-expense"}
                    size={22}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-lg font-bold text-foreground mb-1"
                    numberOfLines={2}
                  >
                    {transaction.description || "Transaction"}
                  </Text>
                  <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                    {category?.name || "Uncategorized"}
                    {account ? ` · ${account.account_name}` : ""}
                  </Text>
                </View>
              </View>

              <Text
                className={`font-mono text-2xl font-bold ${
                  isIncome ? "text-income" : "text-expense"
                }`}
              >
                {displayAmount}
              </Text>
            </View>

            {/* Status + Date Row */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center bg-income/10 rounded-full px-2.5 py-1">
                  <Icon name="CircleCheck" className="text-income" size={13} />
                  <Text className="text-xs font-bold ml-1.5 text-income">
                    Completed
                  </Text>
                </View>
                {isIgnored && (
                  <View className="flex-row items-center bg-warning/10 rounded-full px-2.5 py-1">
                    <Icon name="EyeOff" className="text-warning" size={13} />
                    <Text className="text-xs font-bold ml-1.5 text-warning">
                      Excluded
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-muted-foreground font-medium">
                {formatDate(transaction.transaction_date)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Facts */}
        <View className="px-5 mt-4">
          <View className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <Text className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
              Quick Facts
            </Text>
            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">Category</Text>
                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                  {category?.name || "Uncategorized"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">Account</Text>
                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                  {account?.account_name || "Unknown"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">Type</Text>
                <Text className="text-sm font-bold text-foreground">
                  {isIncome ? "Income" : "Expense"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">Source</Text>
                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                  {accountTypeLabel}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">Currency</Text>
                <Text className="text-sm font-bold text-foreground">
                  {account?.currency || transaction.currency || "USD"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Manage Section */}
        <View className="px-5 mt-4">
          <View className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <Text className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
              Manage
            </Text>

            {/* Category Row */}
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 border-b border-border"
              onPress={handleEditTransaction}
            >
              <View className="flex-1 mr-3">
                <Text className="text-xs text-muted-foreground mb-0.5">
                  Category
                </Text>
                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                  {category?.name || "Uncategorized"}
                </Text>
              </View>
              {account?.editable && (
                <View className="bg-primary/10 rounded-full px-3 py-1.5">
                  <Text className="text-xs font-bold text-primary">Change</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Account Row */}
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 border-b border-border"
              onPress={handleViewAccount}
            >
              <View className="flex-1 mr-3">
                <Text className="text-xs text-muted-foreground mb-0.5">
                  Account
                </Text>
                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                  {account?.account_name || "Unknown"}
                </Text>
              </View>
              <View className="bg-primary/10 rounded-full px-3 py-1.5">
                <Text className="text-xs font-bold text-primary">View</Text>
              </View>
            </TouchableOpacity>

            {/* Tags Row */}
            {transaction.tags && transaction.tags.length > 0 && (
              <View className="py-3 border-b border-border">
                <Text className="text-xs text-muted-foreground mb-2">Tags</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {transaction.tags.map((tag) => (
                    <View
                      key={tag.id}
                      className="rounded-full bg-muted px-2.5 py-1"
                      style={
                        tag.color
                          ? { backgroundColor: `${tag.color}20` }
                          : undefined
                      }
                    >
                      <Text
                        className="text-xs font-semibold text-foreground"
                        style={tag.color ? { color: tag.color } : undefined}
                      >
                        {tag.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Description / Note */}
            {transaction.description && (
              <TouchableOpacity
                className="pt-3"
                onPress={() => setShowFullDescription(!showFullDescription)}
                activeOpacity={0.7}
              >
                <Text className="text-xs text-muted-foreground mb-0.5">
                  Description
                </Text>
                <Text
                  className="text-sm text-foreground leading-5"
                  numberOfLines={showFullDescription ? undefined : 2}
                >
                  {transaction.description}
                </Text>
                {transaction.description.length > 80 && (
                  <Text className="text-xs text-primary font-bold mt-1.5">
                    {showFullDescription ? "Show less" : "Show more"}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-5 mt-4">
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              className="flex-1 bg-card border border-border rounded-2xl py-3.5 px-3 items-center shadow-sm"
              onPress={handleEditTransaction}
            >
              <View className="w-10 h-10 rounded-xl bg-primary/10 justify-center items-center mb-2">
                <Icon name="Pencil" className="text-primary" size={18} />
              </View>
              <Text className="text-sm font-bold text-foreground">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-card border border-border rounded-2xl py-3.5 px-3 items-center shadow-sm"
              onPress={handleToggleIgnore}
            >
              <View className="w-10 h-10 rounded-xl bg-warning/10 justify-center items-center mb-2">
                <Icon
                  name={isIgnored ? "Eye" : "EyeOff"}
                  className="text-warning"
                  size={18}
                />
              </View>
              <Text className="text-sm font-bold text-foreground">
                {isIgnored ? "Include" : "Exclude"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-card border border-border rounded-2xl py-3.5 px-3 items-center shadow-sm"
              onPress={handleDeleteTransaction}
            >
              <View className="w-10 h-10 rounded-xl bg-expense/10 justify-center items-center mb-2">
                <Icon name="Trash2" className="text-destructive" size={18} />
              </View>
              <Text className="text-sm font-bold text-foreground">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Timeline */}
        <View className="px-5 mt-4 mb-8">
          <View className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <Text className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
              Activity
            </Text>

            {/* Transaction Date */}
            <View className="flex-row items-start mb-3">
              <View className="w-2.5 h-2.5 rounded-full bg-income mt-1.5 mr-3" />
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground mb-0.5">
                  Transaction posted
                </Text>
                <Text className="text-xs text-muted-foreground leading-4">
                  {formatDate(transaction.transaction_date)}
                  {" · "}
                  {formatTime(transaction.transaction_date)}
                </Text>
              </View>
            </View>

            {/* Category assignment */}
            {category && (
              <View className="flex-row items-start mb-3">
                <View className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 mr-3" />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground mb-0.5">
                    Categorized as {category.name}
                  </Text>
                  <Text className="text-xs text-muted-foreground leading-4">
                    Assigned to category
                  </Text>
                </View>
              </View>
            )}

            {/* Reference */}
            <View className="flex-row items-start">
              <View className="w-2.5 h-2.5 rounded-full bg-border mt-1.5 mr-3" />
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground mb-0.5">
                  Reference
                </Text>
                <Text className="text-xs text-muted-foreground leading-4">
                  Transaction ID {transaction.id}
                  {account ? ` · Synced from ${accountTypeLabel}` : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
