import React from "react"
import { TouchableOpacity, View } from "react-native"

import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"
import { RecurringTransaction } from "@/types/recurring-transaction"
import { FrequencyBadge } from "./frequency-badge"

type RecurringCardProps = {
  item: RecurringTransaction
  onPress: () => void
}

export function RecurringCard({ item, onPress }: RecurringCardProps) {
  const isExpense = item.transaction_type === "expense"
  const dueDate = new Date(item.next_due_date)
  const isOverdue = item.is_active && dueDate < new Date()
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`rounded-xl bg-card p-4 border ${isOverdue ? "border-destructive" : "border-border"}`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            isExpense ? "bg-red-100" : "bg-green-100"
          }`}>
            <Icon
              name={isExpense ? "ArrowDownLeft" : "ArrowUpRight"}
              size={20}
              className={isExpense ? "text-red-600" : "text-green-600"}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-foreground">{item.name}</Text>
            {item.category && (
              <Text className="text-xs text-muted-foreground">{item.category.name}</Text>
            )}
          </View>
        </View>
        <Text className={`text-base font-semibold ${isExpense ? "text-red-600" : "text-green-600"}`}>
          {item.formatted_amount || `$${item.amount.toLocaleString()}`}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <FrequencyBadge frequency={item.frequency} />
          {item.auto_create && (
            <View className="rounded-full bg-primary/10 px-2 py-0.5">
              <Text className="text-xs font-medium text-primary">Auto</Text>
            </View>
          )}
          {!item.is_active && (
            <View className="rounded-full bg-muted px-2 py-0.5">
              <Text className="text-xs text-muted-foreground">Inactive</Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center">
          <Icon name="Calendar" size={14} className="text-muted-foreground mr-1" />
          <Text className={`text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
            {isOverdue
              ? "Overdue"
              : daysUntilDue === 0
                ? "Due today"
                : daysUntilDue === 1
                  ? "Tomorrow"
                  : `${daysUntilDue} days`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
