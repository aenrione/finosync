import { TouchableOpacity, View, Text } from "react-native"
import { useRouter } from "expo-router"
import React, { useMemo } from "react"

import { showAmount } from "@/utils/currency"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"
import { colors } from "@/lib/colors"

import { useDashboardBudgetSummary } from "./dashboard-card-hooks"

const getProgressWidth = (planned: number, actual: number) => {
  if (planned <= 0) return actual > 0 ? 100 : 0
  return Math.min((actual / planned) * 100, 100)
}

const getProgressColor = (planned: number, actual: number) => {
  if (planned <= 0 && actual <= 0) return colors.border
  if (planned <= 0 || actual > planned) return colors.expense
  if (actual / planned >= 0.75) return colors.warning
  return colors.success
}

export default function BudgetProgressCards() {
  const router = useRouter()
  const isVisible = useStore((state) => state.isVisible)
  const { data: budget } = useDashboardBudgetSummary()

  const allocations = useMemo(() => {
    if (!budget) {
      return []
    }

    return budget.groups
      .filter((group) => group.group.group_type !== "income")
      .flatMap((group) => group.allocations)
      .filter(
        (allocation) =>
          allocation.planned_amount > 0 || allocation.actual_spend > 0,
      )
      .sort((a, b) => {
        const aOver = a.remaining < 0 ? 1 : 0
        const bOver = b.remaining < 0 ? 1 : 0

        if (aOver !== bOver) {
          return bOver - aOver
        }

        return b.actual_spend - a.actual_spend
      })
      .slice(0, 4)
  }, [budget])

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="px-5 mt-6"
      onPress={() => router.push("/(app)/(drawer)/(tabs)/budget")}
    >
      <View className="rounded-3xl border border-border bg-card p-5">
        <View className="mb-4 flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <Icon name="PiggyBank" className="text-primary" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">
                  Budgets
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Category progress cards
                </Text>
              </View>
            </View>
          </View>
          <Icon
            name="ChevronRight"
            className="text-muted-foreground"
            size={18}
          />
        </View>

        {allocations.length > 0 ? (
          <View className="gap-4">
            {allocations.map((allocation) => {
              const progressWidth = getProgressWidth(
                allocation.planned_amount,
                allocation.actual_spend,
              )
              const progressColor = getProgressColor(
                allocation.planned_amount,
                allocation.actual_spend,
              )
              const percentage =
                allocation.planned_amount > 0
                  ? Math.round(
                    (allocation.actual_spend / allocation.planned_amount) *
                        100,
                  )
                  : 0

              return (
                <View key={allocation.transaction_category_id}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-sm font-semibold text-foreground">
                        {allocation.category_name}
                      </Text>
                      <Text className="mt-1 text-xs text-muted-foreground">
                        {showAmount(allocation.actual_spend, isVisible)} spent
                        of {showAmount(allocation.planned_amount, isVisible)}{" "}
                        budget
                      </Text>
                    </View>
                    <Text
                      className={`text-sm font-semibold ${
                        allocation.remaining < 0
                          ? "text-destructive"
                          : "text-foreground"
                      }`}
                    >
                      {percentage}%
                    </Text>
                  </View>

                  <View className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${progressWidth}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </View>
                </View>
              )
            })}
          </View>
        ) : (
          <View className="rounded-2xl border border-dashed border-border bg-background px-4 py-5">
            <Text className="text-sm font-semibold text-foreground">
              No budget progress yet
            </Text>
            <Text className="mt-1 text-xs leading-5 text-muted-foreground">
              Create allocations in the Budget tab and your top categories will
              show up here.
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
