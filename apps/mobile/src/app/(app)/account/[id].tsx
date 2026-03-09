import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useTranslation } from "@/locale/app/account/detail.text";

import ScreenHeader from "@/components/screen-header";
import RouteErrorState from "@/components/errors/route-error-state";
import StaleDataBanner from "@/components/errors/stale-data-banner";
import AccountBalanceChart from "@/components/features/charts/account-balance-chart";
import { useTransactions } from "@/context/transactions.context";
import TransactionFilters from "@/components/transaction-filters";
import { filterTransactions } from "@/utils/transactionFilters";
import { useCategories } from "@/context/categories.context";
import TransactionList from "@/components/transaction-list";
import DeleteAlertWrapper from "@/components/delete-alert";
import { useAccounts } from "@/context/accounts.context";
import { showAmount } from "@/utils/currency";
import { fetchJsonWithAuth, getErrorMessage } from "@/utils/api";
import { loadSnapshot, saveSnapshot } from "@/utils/offline-cache";
import { Text } from "@/components/ui/text";
import { useStore } from "@/utils/store";
import Icon from "@/components/ui/icon";

type AccountDetailData = {
  chart?: {
    balance?: { label: string; balance?: number; income?: number; expenses?: number; net?: number }[];
    avgIncome?: number;
    avgExpenses?: number;
    avgSavings?: number;
    avgBalance?: number;
  };
};

const getAccountTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    local: "border-l-account-local",
    fintoc: "border-l-account-fintoc",
    fintual: "border-l-account-fintual",
    buda: "border-l-account-buda",
  };
  return colors[type] || "border-l-primary";
};

export default function AccountDetailsScreen() {
  const { id } = useLocalSearchParams();
  const text = useTranslation();
  const { accountsData: accounts, deleteAccount } = useAccounts();
  const {
    transactionsData: transactions,
    loading,
    hasMore,
    loadMore,
    refreshData,
  } = useTransactions();
  const { categoriesData: categories } = useCategories();
  const isVisible = useStore((state) => state.isVisible);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [accountData, setAccountData] = useState<AccountDetailData | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountIsStale, setAccountIsStale] = useState(false);
  const [accountLastUpdated, setAccountLastUpdated] = useState<string | null>(
    null,
  );
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const accountCacheKey = `account:${id}:6M`;

  useEffect(() => {
    if (!id) return;
    let active = true;

    const restoreAndFetch = async () => {
      const snapshot = await loadSnapshot<AccountDetailData>(accountCacheKey);

      if (active && snapshot) {
        setAccountData(snapshot.value);
        setAccountLastUpdated(snapshot.updatedAt);
        // Only mark as stale on initial load (no data yet).
        // When changing filters, skip the stale banner — the fetch
        // will either succeed or fail (setting isStale in catch).
        if (!accountData) {
          setAccountIsStale(true);
        }
        setLoadingAccount(false);
      }

      try {
        if (active && !snapshot) {
          setLoadingAccount(true);
        }

        const data = await fetchJsonWithAuth<AccountDetailData>(
          `/accounts/${id}?time_range=6M`,
        );

        if (!active) return;

        setAccountData(data);
        setAccountError(null);
        setAccountIsStale(false);
        const saved = await saveSnapshot(accountCacheKey, data);
        setAccountLastUpdated(saved.updatedAt);
      } catch (error) {
        if (!active) return;

        setAccountError(getErrorMessage(error));
        if (snapshot) {
          setAccountIsStale(true);
        }
      } finally {
        if (active) {
          setLoadingAccount(false);
        }
      }
    };

    restoreAndFetch();

    return () => {
      active = false;
    };
  }, [accountCacheKey, id]);

  const handleDeleteAccount = useCallback(async () => {
    if (!id) return;
    try {
      console.log("Deleting account:", id.toString());
      await deleteAccount(id.toString());
      console.log("Account deleted, refreshing data");
      await refreshData();
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setShowDeleteAlert(false);
    }
  }, [id, deleteAccount, refreshData, router]);

  const account = accounts.find((acc) => acc.id.toString() === id);
  const accountTransactions = transactions.filter(
    (t) => t.account_id?.toString() === id,
  );
  const filteredAccountTransactions = filterTransactions(
    accountTransactions,
    selectedFilter,
    categories,
    accounts,
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshData(),
        fetchJsonWithAuth<AccountDetailData>(
          `/accounts/${id}?time_range=6M`,
        ).then(async (data) => {
          setAccountData(data);
          setAccountError(null);
          setAccountIsStale(false);
          const saved = await saveSnapshot(accountCacheKey, data);
          setAccountLastUpdated(saved.updatedAt);
        }),
      ]);
    } catch (error) {
      setAccountError(getErrorMessage(error));
      setAccountIsStale(Boolean(accountData));
    } finally {
      setRefreshing(false);
    }
  }, [accountCacheKey, accountData, id, refreshData]);

  if (!account) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <Text className="text-foreground">Account not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (accountError && !accountData) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader
          title={account.account_name}
          variant="back"
        />

        <RouteErrorState
          error={accountError}
          title="Couldn't load account details"
          onRetry={async () => {
            const data = await fetchJsonWithAuth<AccountDetailData>(
              `/accounts/${id}?time_range=6M`,
            );
            setAccountData(data);
            setAccountError(null);
            setAccountIsStale(false);
            const saved = await saveSnapshot(accountCacheKey, data);
            setAccountLastUpdated(saved.updatedAt);
          }}
          onSecondaryAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        title={account.account_name}
        variant="back"
        rightActions={[
          { icon: "Trash2", onPress: () => setShowDeleteAlert(true) },
        ]}
      />
      {/* Always render the component, even if not open */}
      <DeleteAlertWrapper
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onDelete={handleDeleteAccount}
        title={text.deleteTitle}
        errorMessage={text.deleteConfirmation({ name: account.account_name })}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {accountIsStale ? (
          <View className="px-5 pt-4">
            <StaleDataBanner updatedAt={accountLastUpdated} />
          </View>
        ) : null}

        {accountError && accountData ? (
          <View className="mx-5 mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3">
            <Text className="text-sm font-semibold text-foreground">
              Account details are offline
            </Text>
            <Text className="mt-1 text-xs leading-5 text-muted-foreground">
              {accountError}
            </Text>
          </View>
        ) : null}

        {/* Account Balance Card */}
        <View className="px-5 mt-6">
          <View
            className={`bg-card rounded-2xl p-6 shadow-sm border-l-4 ${getAccountTypeColor(account.account_type)}`}
          >
            <View className="flex-row justify-between items-start mb-5">
              <View className="flex-row items-start flex-1">
                <View className="w-14 h-14 rounded-full bg-primary/10 justify-center items-center mr-4">
                  <Icon name="CreditCard" className="text-primary" size={28} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-muted-foreground mb-2">
                    Current Balance
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="font-mono text-3xl font-bold text-foreground mr-3">
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
                <Text className="text-sm text-muted-foreground">
                  Account Number
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {account.id.toString()}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  Account Type
                </Text>
                <Text className="text-sm font-semibold text-foreground capitalize">
                  {account.account_type}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  Last Transaction
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {accountTransactions.length > 0
                    ? new Date(
                        accountTransactions[0].transaction_date,
                      ).toLocaleDateString()
                    : "No transactions"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Balance Chart */}
        <View className="px-5 mt-6">
          <AccountBalanceChart
            balanceData={accountData?.chart?.balance || []}
            currency={account.currency}
            avgIncome={accountData?.chart?.avgIncome}
            avgExpenses={accountData?.chart?.avgExpenses}
            avgSavings={accountData?.chart?.avgSavings}
            avgBalance={accountData?.chart?.avgBalance}
            loading={loadingAccount}
          />
        </View>

        {/* Transaction Filters */}
        <View className="px-5 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-foreground">
              Recent Transactions
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity className="w-9 h-9 rounded-full bg-muted justify-center items-center">
                <Icon
                  name="Search"
                  className="text-muted-foreground"
                  size={20}
                />
              </TouchableOpacity>
              <TouchableOpacity className="w-9 h-9 rounded-full bg-muted justify-center items-center">
                <Icon
                  name="FileText"
                  className="text-muted-foreground"
                  size={20}
                />
              </TouchableOpacity>
              <TouchableOpacity className="w-9 h-9 rounded-full bg-muted justify-center items-center">
                <Icon
                  name="Download"
                  className="text-muted-foreground"
                  size={20}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TransactionFilters
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            showTypeFilters={true}
            showCategoryFilters={true}
            showAccountFilters={false}
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
              selectedFilter.toLowerCase() === "all"
                ? "No transactions for this account"
                : `No ${selectedFilter.toLowerCase()} transactions for this account`
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
