import { View } from "react-native"
import { Text } from "@/components/ui/text"

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Tab Two</Text>
      <View className="my-8 w-4/5 h-px bg-border" />
    </View>
  )
}
