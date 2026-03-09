import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import React from "react"

import ScreenHeader from "@/components/screen-header"
import { Text } from "@/components/ui/text"

const Notifications = () => (
  <SafeAreaView className="flex-1 bg-background">
    <ScreenHeader title="Notifications" variant="back" />

    <View className="flex-1 px-5 pt-0 items-center justify-center">
      <Text className="text-center text-muted-foreground text-sm">
          You don&#39;t have any notification yet.
      </Text>
    </View>
  </SafeAreaView>
)

export default Notifications
