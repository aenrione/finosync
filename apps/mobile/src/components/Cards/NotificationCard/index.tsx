import { View } from "react-native"
import React from "react"

import { Text } from "@/components/theme/Themed" // assuming you have a themed Text component
import Icon from "@/components/ui/icon"
import { IconName } from "@/types/icon"

type Notification = {
  date: string
  icon: IconName
  type: "income" | "expense"
  amount: number
  category: string
}

const NotificationCard = ({ notification }:{notification: Notification}) => {
  const date = new Date(notification.date)

  return (
    <View className="mt-2.5 flex-row items-center bg-black">
      {/* Icon */}
      <View className="w-10 h-10 rounded-full bg-light_black flex items-center justify-center">
        <Icon name={notification.icon}/>
      </View>

      {/* Notification Text */}
      <Text className="flex-1 ml-1.25 flex-wrap flex-row">
        {notification.type === "income" ? (
          <Text className="text-xs font-normal text-gray-medium">You received </Text>
        ) : (
          <Text className="text-xs font-normal text-gray-medium">You spent </Text>
        )}
        <Text className="text-xs font-normal text-white">{notification.amount}$</Text>
        <Text className="text-xs font-normal text-gray-medium"> for </Text>
        <Text className="text-xs font-normal text-white">{notification.category}</Text>
        <Text className="text-xs font-normal text-gray-medium"> at </Text>
        <Text className="text-xs font-normal text-white">
          {date.getDate()}.{date.getMonth() + 1}.{date.getFullYear()}
        </Text>
        <Text className="text-xs font-normal text-gray-medium">.</Text>
      </Text>
    </View>
  )
}

export default NotificationCard

