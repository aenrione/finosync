import { View } from "react-native"
import React from "react"

import BackHeader from "@/components/back-header"
import { Text } from "@/components/ui/text"

const Notifications = () => (
  <View className="flex-1 bg-background">
    {/* Header */}
    <BackHeader title="Notifications" />

    {/* Body */}
    <View className="flex-1 px-5 pt-0 items-center justify-center">
      <Text className="text-center text-muted-foreground text-sm">
          You don&#39;t have any notification yet.
      </Text>
    </View>
  </View>
)

export default Notifications
