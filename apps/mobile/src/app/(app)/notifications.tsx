import { View, Text } from "react-native"
import React from "react"

import BackHeader from "@/components/Headers/BackHeader"
import { Typography } from "@/styles"

const Notifications = () => (
  <View className="flex-1 bg-black">
    {/* Header */}
    <BackHeader title="Notifications" />

    {/* Body */}
    <View className="flex-1 px-5 pt-0 items-center justify-center">
      <Text
        className="text-center text-white text-sm"
      >
          You don&#39;t have any notification yet.
      </Text>
    </View>
  </View>
)

export default Notifications

