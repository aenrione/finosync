import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useMemo } from "react";
import { router } from "expo-router";

import RouteErrorState from "@/components/errors/route-error-state";
import StaleDataBanner from "@/components/errors/stale-data-banner";
import type { Account, AccountType } from "@/types/account";

import { useTranslation } from "@/locale/app/drawer/accounts.text";
import { parseNumericAmount, showAmount } from "@/utils/currency";
import { useAccounts } from "@/context/accounts.context";
import ScreenHeader from "@/components/screen-header";
import { Text } from "@/components/ui/text";
import { useStore } from "@/utils/store";
import Icon from "@/components/ui/icon";

type AccountsText = ReturnType<typeof useTranslation>;
type IconName = React.ComponentProps<typeof Icon>["name"];

type InsightMeta = {
  icon: IconName;
  text: string;
  textClass: string;
  bgClass: string;
};

type AccountMeta = {
  icon: IconName;
  accent: string;
  accentBg: string;
  label: string;
};

const ACCOUNT_META: Record<AccountType, Omit<AccountMeta, "label">> = {
  local: {
    icon: "Wallet",
    accent: "text-account-local",
    accentBg: "bg-account-local/10",
  },
  fintoc: {
    icon: "Landmark",
    accent: "text-account-fintoc",
    accentBg: "bg-account-fintoc/10",
  },
  fintual: {
    icon: "TrendingUp",
    accent: "text-account-fintual",
    accentBg: "bg-account-fintual/10",
  },
  buda: {
    icon: "Bitcoin",
    accent: "text-account-buda",
    accentBg: "bg-account-buda/10",
  },
};

function getBalanceValue(account: Account): number {
  return parseNumericAmount(account.balance) ?? 0;
}

function relativeTime(
  dateStr: string | undefined,
  text: AccountsText,
): string | null {
  if (!dateStr) return null;

  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);

  if (mins < 1) return text.timeAgo.now;
  if (mins < 60) return text.timeAgo.minutes(mins);

  const hours = Math.floor(mins / 60);
  if (hours < 24) return text.timeAgo.hours(hours);

  return text.timeAgo.days(Math.floor(hours / 24));
}

function getMaskedAmount(amount: string | undefined): string {
  return showAmount(parseNumericAmount(amount) ?? 0, false);
}

function getDisplayAmount(
  amount: string | undefined,
  isVisible: boolean,
): string {
  if (!isVisible) return getMaskedAmount(amount);
  return amount?.trim() ? amount : "-";
}

function getAccountMeta(account: Account, text: AccountsText): AccountMeta {
  const balance = getBalanceValue(account);

  if (balance < 0) {
    return {
      icon: "CreditCard",
      accent: "text-expense",
      accentBg: "bg-expense/10",
      label: text.groups.liabilities,
    };
  }

  const meta = ACCOUNT_META[account.account_type] ?? ACCOUNT_META.local;

  return {
    ...meta,
    label: text.accountTypes[account.account_type],
  };
}

function getAccountInsight(
  account: Account,
  text: AccountsText,
  isVisible: boolean,
): InsightMeta | null {
  const investmentReturn =
    account.investments_return ?? account.investment_return;
  const investmentReturnValue = parseNumericAmount(investmentReturn) ?? 0;
  if (investmentReturnValue !== 0 && investmentReturn) {
    return {
      icon: investmentReturnValue > 0 ? "TrendingUp" : "TrendingDown",
      text: `${getDisplayAmount(investmentReturn, isVisible)} ${text.returnLabel}`,
      textClass: investmentReturnValue > 0 ? "text-success" : "text-expense",
      bgClass: investmentReturnValue > 0 ? "bg-success/10" : "bg-expense/10",
    };
  }

  if (account.change_pct !== undefined && account.change_pct !== null) {
    const positive = account.change_pct > 0;
    const neutral = account.change_pct === 0;

    return {
      icon: neutral ? "Minus" : positive ? "TrendingUp" : "TrendingDown",
      text: `${positive ? "+" : ""}${account.change_pct.toFixed(1)}% ${text.thisMonth}`,
      textClass: neutral
        ? "text-muted-foreground"
        : positive
          ? "text-success"
          : "text-expense",
      bgClass: neutral
        ? "bg-muted"
        : positive
          ? "bg-success/10"
          : "bg-expense/10",
    };
  }

  const expenseValue = parseNumericAmount(account.expense) ?? 0;
  if (expenseValue > 0 && account.expense) {
    return {
      icon: "ArrowUpRight",
      text: `${text.expenses} ${getDisplayAmount(account.expense, isVisible)}`,
      textClass: "text-expense",
      bgClass: "bg-expense/10",
    };
  }

  const incomeValue = parseNumericAmount(account.income) ?? 0;
  if (incomeValue > 0 && account.income) {
    return {
      icon: "ArrowDownLeft",
      text: `${text.income} ${getDisplayAmount(account.income, isVisible)}`,
      textClass: "text-success",
      bgClass: "bg-success/10",
    };
  }

  return null;
}

function AccountRow({
  account,
  text,
  isLast,
}: {
  account: Account;
  text: AccountsText;
  isLast: boolean;
}) {
  const isVisible = useStore((state) => state.isVisible);
  const updated = relativeTime(account.refreshed_at, text);
  const balance = getBalanceValue(account);
  const meta = getAccountMeta(account, text);
  const insight = getAccountInsight(account, text, isVisible);

  const detailParts = [meta.label];
  if (account.currency || account.code) {
    detailParts.push(account.currency || account.code);
  }
  if (updated) {
    detailParts.push(`${text.lastUpdated} ${updated}`);
  }

  return (
    <TouchableOpacity
      className={`px-4 py-3.5 ${!isLast ? "border-b border-border" : ""}`}
      activeOpacity={0.7}
      onPress={() => router.push(`/(app)/account/${account.id}`)}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`h-11 w-11 items-center justify-center rounded-2xl ${meta.accentBg}`}
        >
          <Icon name={meta.icon} size={20} className={meta.accent} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-start gap-3">
            <View className="flex-1">
              <Text
                className="text-sm font-semibold text-foreground"
                numberOfLines={1}
              >
                {account.account_name}
              </Text>
              <Text
                className="mt-1 text-xs text-muted-foreground"
                numberOfLines={1}
              >
                {detailParts.join(" · ")}
              </Text>
              {insight && (
                <View
                  className={`mt-2 self-start rounded-full px-2 py-1 ${insight.bgClass}`}
                >
                  <View className="flex-row items-center gap-1">
                    <Icon
                      name={insight.icon}
                      size={12}
                      className={insight.textClass}
                    />
                    <Text
                      className={`text-2xs font-medium ${insight.textClass}`}
                    >
                      {insight.text}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="items-end">
              <Text
                className={`text-base font-bold ${balance < 0 ? "text-expense" : "text-foreground"}`}
              >
                {getDisplayAmount(account.balance, isVisible)}
              </Text>
            </View>
          </View>
        </View>

        <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ text }: { text: AccountsText }) {
  return (
    <View className="items-center justify-center rounded-xl border border-border bg-card px-6 py-12">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Icon name="Wallet" size={28} className="text-primary" />
      </View>
      <Text className="text-lg font-bold text-foreground">
        {text.noAccounts}
      </Text>
      <Text className="mt-1 text-center text-sm text-muted-foreground">
        {text.noAccountsDescription}
      </Text>
      <TouchableOpacity
        className="mt-5 flex-row items-center gap-2 rounded-lg bg-primary px-5 py-3"
        onPress={() => router.push("/(app)/add-account")}
      >
        <Icon name="Plus" size={18} color="white" />
        <Text className="text-sm font-semibold text-white">
          {text.addAccount}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AccountsTabScreen() {
  const text = useTranslation();
  const {
    accountsData,
    loading,
    refreshing,
    error,
    isStale,
    lastUpdated,
    refreshData,
  } = useAccounts();

  const sortedAccounts = useMemo(
    () =>
      [...accountsData].sort(
        (left, right) =>
          Math.abs(getBalanceValue(right)) - Math.abs(getBalanceValue(left)),
      ),
    [accountsData],
  );

  const hasAccounts = sortedAccounts.length > 0;

  if (loading && !hasAccounts) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader
          variant="drawer"
          title={text.title}
          rightActions={[
            { icon: "Plus", onPress: () => router.push("/(app)/add-account") },
          ]}
        />
        <View className="flex-1 items-center justify-center px-5">
          <Icon name="Wallet" size={28} className="text-muted-foreground" />
          <Text className="mt-4 text-base font-semibold text-foreground">
            Loading accounts...
          </Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            We&apos;re syncing your latest balances and account activity.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !hasAccounts) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader
          variant="drawer"
          title={text.title}
          rightActions={[
            { icon: "Plus", onPress: () => router.push("/(app)/add-account") },
          ]}
        />
        <RouteErrorState
          error={error}
          title={text.errorTitle}
          onRetry={refreshData}
          onSecondaryAction={() =>
            router.replace("/(app)/(drawer)/(tabs)/dashboard")
          }
          secondaryLabel="Open dashboard"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        variant="drawer"
        title={text.title}
        rightActions={[
          { icon: "Plus", onPress: () => router.push("/(app)/add-account") },
        ]}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        <View className="gap-5 px-5 py-5">
          {isStale ? <StaleDataBanner updatedAt={lastUpdated} /> : null}

          {error && hasAccounts && (
            <View className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <Text className="text-sm font-semibold text-foreground">
                {text.errorTitle}
              </Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                {error}
              </Text>
            </View>
          )}

          {!hasAccounts && !loading && <EmptyState text={text} />}

          {hasAccounts && (
            <View className="overflow-hidden rounded-2xl border border-border bg-card">
              {sortedAccounts.map((account, index) => (
                <AccountRow
                  key={account.id}
                  account={account}
                  text={text}
                  isLast={index === sortedAccounts.length - 1}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
