import { View, Text, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"
import React from "react"

import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"

export default function DashboardHeader() {
  const { t } = useTranslation()
  const user = useStore((state) => state.user)
  const isVisible = useStore((state) => state.isVisible)
  const toggleVisibility = useStore((state) => state.toggleVisibility)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t("greetings.morning")
    if (hour < 18) return t("greetings.afternoon")
    return t("greetings.evening")
  }

  return (
    <View className="flex-row items-center justify-between px-5 pt-4 border-b border-border">
      <View className="flex-1">
        <Text className="text-sm text-muted-foreground mb-1">{getGreeting()}</Text>
        <Text className="text-xl font-bold text-foreground">{user?.name}</Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity 
          className="w-9 h-9 rounded-full bg-muted justify-center items-center"
          onPress={toggleVisibility}
        >
          <Icon 
            name={isVisible ? "EyeOff" : "Eye"} 
            className="text-muted-foreground" 
            size={20} 
          />
        </TouchableOpacity>
      </View>
    </View>
  )
} 