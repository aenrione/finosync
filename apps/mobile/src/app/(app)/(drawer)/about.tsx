import { View, Text } from "@/components/theme/Themed"

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Tab Two</Text>
      <View className="my-8 w-4/5 h-px bg-gray-200 dark:bg-gray-700" />
    </View>
  )
}

