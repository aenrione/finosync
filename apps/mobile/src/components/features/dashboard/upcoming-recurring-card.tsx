import { TouchableOpacity, View, Text } from "react-native"
import { useRouter } from "expo-router"
import React from "react"

import { getCurrencyMeta, showAmount } from "@/utils/currency"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"

import { useDashboardUpcomingRecurring } from "./dashboard-card-hooks"

const formatDueDate = (value: string) => {
  const date = new Date(value)

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export default function UpcomingRecurringCard() {
  const router = useRouter()
  const isVisible = useStore((state) => state.isVisible)
  const baseCurrency = useStore((state) => state.baseCurrency)
  const currencySymbol = getCurrencyMeta(baseCurrency).symbol
  const { data: items } = useDashboardUpcomingRecurring(14)

  const upcomingItems = (items || []).slice(0, 4)

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="px-5 mt-6 mb-8"
      onPress={() => router.push("/(app)/(drawer)/recurring")}
    >
      <View className="rounded-3xl border border-border bg-card p-5">
        <View className="mb-4 flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <Icon name="Repeat" className="text-primary" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">
                  Subscriptions & recurring
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Upcoming recurring charges
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

        {upcomingItems.length > 0 ? (
          <View className="gap-4">
            {upcomingItems.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center justify-between gap-3"
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {item.name}
                  </Text>
                  <Text className="mt-1 text-xs text-muted-foreground">
                    {formatDueDate(item.next_due_date)}
                    {item.category?.name ? ` · ${item.category.name}` : ""}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-foreground">
                  {showAmount(item.amount, isVisible, currencySymbol)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="rounded-2xl border border-dashed border-border bg-background px-4 py-5">
            <Text className="text-sm font-semibold text-foreground">
              No upcoming recurring charges
            </Text>
            <Text className="mt-1 text-xs leading-5 text-muted-foreground">
              Add subscriptions, rent, or other repeating payments and they will
              appear here.
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
