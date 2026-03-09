import React from "react"
import { View } from "react-native"

import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"
import { RecurringTransaction } from "@/types/recurring-transaction"
import { RecurringCard } from "./recurring-card"

type UpcomingListProps = {
  items: RecurringTransaction[]
  onItemPress: (item: RecurringTransaction) => void
}

export function UpcomingList({ items, onItemPress }: UpcomingListProps) {
  if (items.length === 0) {
    return (
      <View className="items-center py-6">
        <Icon name="CalendarCheck" size={32} className="text-muted-foreground mb-2" />
        <Text className="text-sm text-muted-foreground">No upcoming payments</Text>
      </View>
    )
  }

  return (
    <View className="gap-3">
      {items.map((item) => (
        <RecurringCard
          key={item.id}
          item={item}
          onPress={() => onItemPress(item)}
        />
      ))}
    </View>
  )
}
