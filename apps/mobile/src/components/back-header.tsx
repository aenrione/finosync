import { View, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import React from "react"

import Icon from "@/components/ui/icon"

const BackHeader = ({ title }) => {
  const router = useRouter()

  return (
    <View className="p-5 flex-row items-center bg-background">
      <TouchableOpacity
        activeOpacity={0.8}
        className="p-1 absolute left-5 z-10"
        onPress={() => router.back()}
      >
        <Icon name="ChevronLeft" className="text-foreground" size={20} />
      </TouchableOpacity>

      <Text className="flex-1 text-lg font-semibold text-center text-foreground">{title}</Text>
    </View>
  )
}

export default BackHeader
