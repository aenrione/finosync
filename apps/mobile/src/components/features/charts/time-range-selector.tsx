import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

import { useCharts } from "@/context/charts.context";

const timeRanges = ["1M", "3M", "6M", "1Y"];

export default function TimeRangeSelector() {
  const { timeRange, setTimeRange } = useCharts();

  return (
    <View className="mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-foreground">View</Text>
        <View className="flex-row gap-2 rounded-full bg-card border border-border p-1">
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              className={`px-4 py-1.5 rounded-full ${timeRange === range ? "bg-primary" : "bg-transparent"}`}
              onPress={() => setTimeRange(range)}
            >
              <Text
                className={`text-sm font-medium ${timeRange === range ? "text-white" : "text-muted-foreground"}`}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
