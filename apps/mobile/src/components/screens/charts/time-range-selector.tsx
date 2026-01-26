import { View, Text, TouchableOpacity } from "react-native"
import React from "react"

import { useCharts } from "@/context/charts.context"

const timeRanges = ["1M", "3M", "6M", "1Y"]

export default function TimeRangeSelector() {
  const { timeRange, setTimeRange } = useCharts()

  return (
    <View className="mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-foreground">Time Range</Text>
        <View className="flex-row bg-muted rounded-lg p-1">
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              className={`px-3 py-1.5 rounded-md ${timeRange === range ? "bg-background shadow-sm" : ""}`}
              onPress={() => setTimeRange(range)}
            >
              <Text className={`text-sm font-medium ${timeRange === range ? "text-blue-600" : "text-muted-foreground"}`}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
} 