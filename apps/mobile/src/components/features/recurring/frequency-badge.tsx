import React from "react"
import { View } from "react-native"

import { Text } from "@/components/ui/text"
import { RecurringFrequency } from "@/types/recurring-transaction"

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  semi_annually: "Semi-annual",
  annually: "Annual",
}

const FREQUENCY_COLORS: Record<RecurringFrequency, string> = {
  weekly: "bg-blue-100 text-blue-700",
  biweekly: "bg-indigo-100 text-indigo-700",
  monthly: "bg-purple-100 text-purple-700",
  quarterly: "bg-orange-100 text-orange-700",
  semi_annually: "bg-amber-100 text-amber-700",
  annually: "bg-green-100 text-green-700",
}

type FrequencyBadgeProps = {
  frequency: RecurringFrequency
}

export function FrequencyBadge({ frequency }: FrequencyBadgeProps) {
  const colors = FREQUENCY_COLORS[frequency] || "bg-muted text-muted-foreground"

  return (
    <View className={`rounded-full px-2.5 py-0.5 ${colors.split(" ")[0]}`}>
      <Text className={`text-xs font-medium ${colors.split(" ")[1]}`}>
        {FREQUENCY_LABELS[frequency] || frequency}
      </Text>
    </View>
  )
}
