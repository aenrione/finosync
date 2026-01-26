import React from "react"

import { View, Text } from "@/components/theme/Themed"

type ChildrenProps = {
  children: React.ReactNode
}

export const Card = ({ children } :ChildrenProps) => (
  <View className="bg-white p-4 rounded-xl shadow-md mb-4">
    {children}
  </View>
)

export const CardTitle = ({ children }: ChildrenProps) => (
  <Text className=" font-semibold mb-2">{children}</Text>
)

export const Divider = () => (
  <View className=" border-gray-200 my-2" />
)

