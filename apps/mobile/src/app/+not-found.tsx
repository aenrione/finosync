import { Link, Stack } from "expo-router"
import { View } from "react-native"
import React from "react"

import { Text } from "@/components/ui/text"

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-xl font-bold">This screen doesnt exist.</Text>

        <Link href="/(app)/(drawer)/(tabs)/dashboard" className="mt-4 py-4">
          <Text className="text-sm text-primary">Go to home screen!</Text>
        </Link>
      </View>
    </>
  )
}
