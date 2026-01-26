import { View  } from "react-native"
import React from "react"

type CustomIndicatorProps = {
  size?: number
}

export default function CustomIndicator({size=50}: CustomIndicatorProps) {
  return (
    <View className="flex flex-row justify-center">
      <View
        className={`w-${size} h-${size} border-4 border-t-transparent border-b-transparent border-l-primary animate-spin`}
      />
    </View>
  )
}
