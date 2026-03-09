import { View, Text } from "react-native"
import React, { useMemo } from "react"

import {
  getCurrencyMeta,
  parseNumericAmount,
  showAmount,
} from "@/utils/currency"
import { Account } from "@/types/account"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"
import { colors } from "@/lib/colors"

import {
  useDashboardBudgetSummary,
  useDashboardUpcomingRecurring,
} from "./dashboard-card-hooks"

type SpendingPeriod = {
  total_spent?: string | number;
  total_earned?: string | number;
};

type DashboardData = {
  accounts?: Account[];
  spending_insights?: {
    this_month?: SpendingPeriod;
  };
};

type SnapshotCardProps = {
  icon: Parameters<typeof Icon>[0]["name"];
  title: string;
  value: string;
  note: string;
  toneClass: string;
  iconColor: string;
};

function SnapshotCard({
  icon,
  title,
  value,
  note,
  toneClass,
  iconColor,
}: SnapshotCardProps) {
  return (
    <View
      className={`flex-1 rounded-2xl border border-border px-4 py-4 ${toneClass}`}
    >
      <View className="mb-3 h-10 w-10 items-center justify-center rounded-2xl bg-white/70">
        <Icon name={icon} size={18} color={iconColor} />
      </View>
      <Text className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </Text>
      <Text className="mt-2 text-2xl font-bold font-mono text-foreground">
        {value}
      </Text>
      <Text className="mt-2 text-xs leading-5 text-muted-foreground">
        {note}
      </Text>
    </View>
  )
}

export default function MonthSnapshot({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  const isVisible = useStore((state) => state.isVisible)
  const baseCurrency = useStore((state) => state.baseCurrency)
  const currencySymbol = getCurrencyMeta(baseCurrency).symbol
  const { data: budget } = useDashboardBudgetSummary()
  const { data: recurring } = useDashboardUpcomingRecurring(14)

  const snapshot = useMemo(() => {
    const accounts = dashboard.accounts || []
    const cashOnHand = accounts
      .filter((account) => ["local", "fintoc"].includes(account.account_type))
      .reduce(
        (sum, account) => sum + (parseNumericAmount(account.balance) ?? 0),
        0,
      )

    const fallbackCash = accounts.reduce(
      (sum, account) => sum + (parseNumericAmount(account.balance) ?? 0),
      0,
    )

    const totalCash = cashOnHand > 0 ? cashOnHand : fallbackCash
    const currentMonth = dashboard.spending_insights?.this_month
    const spent = parseNumericAmount(currentMonth?.total_spent) ?? 0
    const earned = parseNumericAmount(currentMonth?.total_earned) ?? 0
    const saved = earned - spent
    const savingsRate = earned > 0 ? (saved / earned) * 100 : null
    const recurringItems = recurring || []
    const upcomingBills = recurringItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    )

    const budgetRemaining =
      budget?.groups
        .filter((group) => group.group.group_type !== "income")
        .flatMap((group) => group.allocations)
        .reduce((sum, allocation) => sum + allocation.remaining, 0) ?? null

    const trackedCategories =
      budget?.groups
        .filter((group) => group.group.group_type !== "income")
        .flatMap((group) => group.allocations)
        .filter(
          (allocation) =>
            allocation.planned_amount > 0 || allocation.actual_spend > 0,
        ).length ?? 0

    return {
      totalCash,
      cashAccounts: accounts.filter((account) =>
        ["local", "fintoc"].includes(account.account_type),
      ).length,
      savingsRate,
      saved,
      upcomingBills,
      upcomingCount: recurringItems.length,
      budgetRemaining,
      trackedCategories,
    }
  }, [budget, dashboard.accounts, dashboard.spending_insights, recurring])

  return (
    <View className="px-5 mt-6">
      <View className="rounded-3xl border border-border bg-card p-5">
        <View className="mb-4 flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Icon name="Sparkles" className="text-primary" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">
              Month Snapshot
            </Text>
            <Text className="text-xs text-muted-foreground">
              Fast signals across cash, savings, bills, and budget health
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <SnapshotCard
            icon="Wallet"
            title="Cash on hand"
            value={showAmount(snapshot.totalCash, isVisible, currencySymbol)}
            note={`${snapshot.cashAccounts || 0} liquid accounts tracked`}
            toneClass="bg-emerald-50"
            iconColor={colors.success}
          />
          <SnapshotCard
            icon="PiggyBank"
            title="Savings rate"
            value={
              snapshot.savingsRate === null
                ? "-"
                : `${snapshot.savingsRate.toFixed(1)}%`
            }
            note={
              snapshot.savingsRate === null
                ? "No income recorded this month"
                : `${showAmount(snapshot.saved, isVisible, currencySymbol)} saved this month`
            }
            toneClass="bg-sky-50"
            iconColor={colors.savings}
          />
        </View>

        <View className="mt-3 flex-row gap-3">
          <SnapshotCard
            icon="CalendarClock"
            title="Upcoming bills"
            value={showAmount(
              snapshot.upcomingBills,
              isVisible,
              currencySymbol,
            )}
            note={`${snapshot.upcomingCount} recurring charges due in 14 days`}
            toneClass="bg-amber-50"
            iconColor={colors.warning}
          />
          <SnapshotCard
            icon="Target"
            title="Budget left"
            value={
              snapshot.budgetRemaining === null
                ? "-"
                : showAmount(
                  snapshot.budgetRemaining,
                  isVisible,
                  currencySymbol,
                )
            }
            note={
              snapshot.trackedCategories > 0
                ? `${snapshot.trackedCategories} categories tracked this month`
                : "Set up allocations to track category progress"
            }
            toneClass="bg-violet-50"
            iconColor={colors.primary}
          />
        </View>
      </View>
    </View>
  )
}
