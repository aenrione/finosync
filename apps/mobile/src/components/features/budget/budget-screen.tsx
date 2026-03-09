import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "react-query";

import RouteErrorState from "@/components/errors/route-error-state";
import StaleDataBanner from "@/components/errors/stale-data-banner";
import Icon from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  copyPreviousMonth,
  fetchBudgetSummary,
  upsertAllocation,
} from "@/services/budget-period.service";
import { BudgetAllocation, BudgetSummary } from "@/types/budget-period";
import { getErrorMessage } from "@/utils/api";
import { getCurrencyMeta, showAmount } from "@/utils/currency";
import { loadSnapshot, saveSnapshot } from "@/utils/offline-cache";
import { useStore } from "@/utils/store";

import BudgetMonthNav from "./budget-month-nav";
import BudgetSummaryCard from "./budget-summary-card";
import CategoryGroupSection from "./category-group-section";
import EditAllocationModal from "./edit-allocation-modal";

function SectionHeading({
  title,
  subtitle,
  tone = "default",
}: {
  title: string;
  subtitle: string;
  tone?: "default" | "warning";
}) {
  const titleClassName =
    tone === "warning" ? "text-warning" : "text-muted-foreground";

  return (
    <View className="px-5">
      <Text
        className={`text-[11px] font-semibold uppercase tracking-[1.5px] ${titleClassName}`}
      >
        {title}
      </Text>
      <Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text>
    </View>
  );
}

export default function BudgetScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showUnbudgeted, setShowUnbudgeted] = useState(true);
  const [editingAllocation, setEditingAllocation] =
    useState<BudgetAllocation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const baseCurrency = useStore((s) => s.baseCurrency);
  const isVisible = useStore((s) => s.isVisible);
  const currencySymbol = getCurrencyMeta(baseCurrency).symbol;
  const queryClient = useQueryClient();

  const queryKey = ["budget-summary", year, month, baseCurrency];
  const cacheKey = useMemo(
    () => `budget:${year}:${month}:${baseCurrency}`,
    [year, month, baseCurrency],
  );
  const [cachedBudget, setCachedBudget] = useState<BudgetSummary | null>(null);
  const [cachedUpdatedAt, setCachedUpdatedAt] = useState<string | null>(null);

  const {
    data: budget,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery<BudgetSummary>(queryKey, () =>
    fetchBudgetSummary(year, month, baseCurrency),
  );

  useEffect(() => {
    let active = true;

    const restoreSnapshot = async () => {
      const snapshot = await loadSnapshot<BudgetSummary>(cacheKey);

      if (active && snapshot) {
        setCachedBudget(snapshot.value);
        setCachedUpdatedAt(snapshot.updatedAt);
      }
    };

    restoreSnapshot();

    return () => {
      active = false;
    };
  }, [cacheKey]);

  useEffect(() => {
    if (!budget) return;

    setCachedBudget(budget);
    void saveSnapshot(cacheKey, budget).then((snapshot) => {
      setCachedUpdatedAt(snapshot.updatedAt);
    });
  }, [budget, cacheKey]);

  const upsertMutation = useMutation(
    ({
      periodId,
      categoryId,
      amount,
    }: {
      periodId: number;
      categoryId: number;
      amount: number;
    }) => upsertAllocation(periodId, categoryId, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
        setModalVisible(false);
        setEditingAllocation(null);
      },
    },
  );

  const copyMutation = useMutation(
    () => copyPreviousMonth(year, month, baseCurrency),
    { onSuccess: () => queryClient.invalidateQueries(queryKey) },
  );

  const handleMonthChange = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
  }, []);

  const handleAllocationPress = useCallback(
    (categoryId: number) => {
      const currentBudget = budget ?? cachedBudget;
      if (!currentBudget) return;

      for (const group of currentBudget.groups) {
        const alloc = group.allocations.find(
          (a) => a.transaction_category_id === categoryId,
        );
        if (alloc) {
          setEditingAllocation(alloc);
          setModalVisible(true);
          return;
        }
      }
    },
    [budget, cachedBudget],
  );

  const handleBudgetUnbudgeted = useCallback(
    (categoryId: number) => {
      const currentBudget = budget ?? cachedBudget;
      if (!currentBudget) return;
      const cat = currentBudget.unbudgeted_categories.find(
        (c) => c.id === categoryId,
      );
      if (cat) {
        setEditingAllocation({
          id: null,
          planned_amount: 0,
          actual_spend: cat.actual_spend,
          remaining: 0,
          rollover_in: 0,
          transaction_category_id: cat.id,
          category_name: cat.name,
          category_icon: cat.icon,
        });
        setModalVisible(true);
      }
    },
    [budget, cachedBudget],
  );

  const handleSave = useCallback(
    (amount: number) => {
      const currentBudget = budget ?? cachedBudget;
      if (!currentBudget || !editingAllocation) return;
      upsertMutation.mutate({
        periodId: currentBudget.period.id,
        categoryId: editingAllocation.transaction_category_id,
        amount,
      });
    },
    [budget, cachedBudget, editingAllocation, upsertMutation],
  );

  const displayBudget = budget ?? cachedBudget;
  const hasAllocations =
    displayBudget && displayBudget.groups.some((g) => g.allocations.length > 0);
  const budgetedCategoryCount = displayBudget
    ? displayBudget.groups.reduce(
        (total, group) => total + group.allocations.length,
        0,
      )
    : 0;

  if (isLoading && !displayBudget) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="large" />
        <Text className="mt-4 text-muted-foreground">Loading budget...</Text>
      </View>
    );
  }

  if (error && !displayBudget) {
    return (
      <RouteErrorState
        error={error}
        title="Couldn't load budget"
        onRetry={async () => {
          await refetch();
        }}
        onSecondaryAction={() =>
          router.replace("/(app)/(drawer)/(tabs)/dashboard")
        }
        secondaryLabel="Open dashboard"
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <BudgetMonthNav year={year} month={month} onChange={handleMonthChange} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {error && displayBudget ? (
          <View className="px-5 pt-4">
            <StaleDataBanner updatedAt={cachedUpdatedAt} />
            <View className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3">
              <Text className="text-sm font-semibold text-foreground">
                Budget is offline
              </Text>
              <Text className="mt-1 text-xs leading-5 text-muted-foreground">
                {getErrorMessage(error, "Failed to load budget")}
              </Text>
            </View>
          </View>
        ) : null}

        {displayBudget && (
          <>
            <BudgetSummaryCard
              leftToBudget={displayBudget.left_to_budget}
              totalIncome={displayBudget.total_income}
              totalPlanned={displayBudget.total_planned}
              totalActual={displayBudget.total_actual}
            />

            {/* Copy from last month */}
            {!hasAllocations && (
              <TouchableOpacity
                className="mx-5 mt-4 bg-primary/10 rounded-xl py-3 flex-row items-center justify-center"
                onPress={() => copyMutation.mutate()}
                disabled={copyMutation.isLoading}
              >
                <Icon name="Copy" size={16} className="text-primary mr-2" />
                <Text className="text-primary font-semibold">
                  {copyMutation.isLoading
                    ? "Copying..."
                    : "Copy from last month"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Category groups */}
            <View className="mt-6">
              <SectionHeading
                title="Budgeted"
                subtitle={
                  budgetedCategoryCount > 0
                    ? `${budgetedCategoryCount} categories already have a plan for this month.`
                    : "Budget categories to move them out of the unbudgeted list."
                }
              />

              {budgetedCategoryCount > 0 ? (
                <View className="mt-3">
                  {displayBudget.groups.map((group) => (
                    <CategoryGroupSection
                      key={group.group.id}
                      group={group}
                      onAllocationPress={handleAllocationPress}
                    />
                  ))}
                </View>
              ) : (
                <View className="mx-5 mt-3 rounded-2xl border border-dashed border-border bg-card px-4 py-5">
                  <Text className="text-sm font-semibold text-foreground">
                    No budgeted categories yet
                  </Text>
                  <Text className="mt-1 text-xs leading-5 text-muted-foreground">
                    Tap Budget it on a category below and it will move here with
                    its budget, spend, and remaining amount.
                  </Text>
                </View>
              )}
            </View>

            {/* Unbudgeted categories */}
            {displayBudget.unbudgeted_categories.length > 0 && (
              <View className="mt-6 mb-6">
                <SectionHeading
                  title="Unbudgeted"
                  subtitle="Categories with spending that still need a plan."
                  tone="warning"
                />

                <TouchableOpacity
                  className="mx-5 mt-3 flex-row items-center justify-between rounded-2xl border border-warning/20 bg-warning/5 px-5 py-3"
                  onPress={() => setShowUnbudgeted(!showUnbudgeted)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Icon
                      name={showUnbudgeted ? "ChevronDown" : "ChevronRight"}
                      size={16}
                      className="text-warning mr-2"
                    />
                    <View>
                      <Text className="text-sm font-semibold text-foreground">
                        Unbudgeted ({displayBudget.unbudgeted_categories.length}
                        )
                      </Text>
                      <Text className="text-xs text-warning">
                        Review and assign a budget.
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {showUnbudgeted && (
                  <View className="mx-5 mt-3 overflow-hidden rounded-2xl border border-border bg-card">
                    {displayBudget.unbudgeted_categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        className="flex-row items-center border-b border-border/70 px-4 py-3.5 last:border-b-0"
                        onPress={() => handleBudgetUnbudgeted(cat.id)}
                        activeOpacity={0.75}
                      >
                        <View className="mr-3 h-7 w-7 rounded-full bg-warning/10 items-center justify-center">
                          <Icon
                            name={cat.icon as any}
                            size={14}
                            className="text-warning"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-foreground">
                            {cat.name}
                          </Text>
                          <Text className="mt-1 text-xs text-muted-foreground">
                            {showAmount(
                              cat.actual_spend,
                              isVisible,
                              currencySymbol,
                            )}{" "}
                            spent this month
                          </Text>
                        </View>
                        <View className="ml-3 items-end">
                          <Text className="text-xs font-semibold text-primary">
                            Budget it
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View className="h-8" />
          </>
        )}
      </ScrollView>

      <EditAllocationModal
        visible={modalVisible}
        allocation={editingAllocation}
        onClose={() => {
          setModalVisible(false);
          setEditingAllocation(null);
        }}
        onSave={handleSave}
        saving={upsertMutation.isLoading}
      />
    </View>
  );
}
