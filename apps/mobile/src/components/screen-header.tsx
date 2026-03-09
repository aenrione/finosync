import { useNavigation, DrawerActions } from "@react-navigation/native"
import { TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import React from "react"

import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"
import { IconName } from "@/types/icon"

type RightAction = {
  icon: IconName;
  onPress: () => void;
};

type ScreenHeaderProps = {
  title: string;
  rightActions?: RightAction[];
  variant?: "drawer" | "back" | "none" | "auto";
};

export default function ScreenHeader({
  title,
  rightActions = [],
  variant = "none",
}: ScreenHeaderProps) {
  const navigation = useNavigation()
  const router = useRouter()
  const resolvedVariant =
    variant === "auto" ? (navigation.canGoBack() ? "back" : "drawer") : variant

  return (
    <View className="h-14 flex-row items-center px-4 bg-background border-b border-border">
      {/* Left */}
      <View className="w-10 items-start">
        {resolvedVariant === "drawer" ? (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            hitSlop={8}
          >
            <Icon name="Menu" size={22} className="text-foreground" />
          </TouchableOpacity>
        ) : resolvedVariant === "back" ? (
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Icon name="ArrowLeft" size={22} className="text-foreground" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Center */}
      <View className="flex-1 items-center">
        <Text
          className="text-base font-semibold text-foreground"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* Right */}
      <View className="min-w-[40px] flex-row justify-end gap-3">
        {rightActions.map((action, i) => (
          <TouchableOpacity
            key={`${action.icon}-${i}`}
            onPress={action.onPress}
            hitSlop={8}
          >
            <Icon
              name={action.icon}
              size={20}
              className="text-muted-foreground"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
