import { View, Text } from "react-native"
import React from "react"

const MoneyBoxCard = ({ item, currency }) => {
  const progress = (item.collected / item.total) * 100
  const isComplete = item.collected === item.total

  return (
    <View className="p-5 mb-2 ml-5 rounded-xl bg-light-black">
      <Text className="text-white mb-1 text-sm">
        {item.name}
      </Text>

      <Text className="mb-5 text-left text-sm">
        <Text className="text-gray-thin">{currency} {item.collected} / {item.total} </Text>
        {isComplete && <Text className="text-success">collected</Text>}
      </Text>

      {/* Progress Bar */}
      <View
        className={`border rounded-md ${isComplete ? "border-success" : "border-primary"}`}
      >
        <View
          className={`rounded px-1 ${isComplete ? "bg-success" : "bg-primary"}`}
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  )
}

export default MoneyBoxCard
