import { DrawerContentScrollView } from "@react-navigation/drawer"
import { DrawerContentComponentProps } from "@react-navigation/drawer"
import { View, TouchableOpacity, Image } from "react-native"
import React from "react"

import { Text } from "@/components/ui/text"
import { appName } from "@/constants/config"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"
import { Divider } from "@/components/ui/card"
import { colors } from "@/lib/colors"

import { useTranslation } from "./_texts/text"

type DrawerItem = {
  label: string
  icon: string
  route: string
}

type DrawerSection = {
  title: string
  items: DrawerItem[]
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground px-4 pt-5 pb-2">
      {title}
    </Text>
  )
}

function DrawerMenuItem({
  item,
  isActive,
  onPress,
}: {
  item: DrawerItem
  isActive: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      className={`flex-row items-center px-4 py-3 mx-2 rounded-xl ${
        isActive ? "bg-primary/10" : ""
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className={`w-9 h-9 rounded-xl items-center justify-center ${
          isActive ? "bg-primary/20" : "bg-muted"
        }`}
      >
        <Icon
          name={item.icon as any}
          size={18}
          color={isActive ? colors.primary : colors.mutedForeground}
        />
      </View>
      <Text
        className={`ml-3 text-sm font-medium ${
          isActive ? "text-primary" : "text-foreground"
        }`}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  )
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const logout = useStore((state) => state.logout)
  const user = useStore((state) => state.user)
  const text = useTranslation()

  const currentRoute = props.state.routes[props.state.index]?.name

  const sections: DrawerSection[] = [
    {
      title: text.sections.main,
      items: [
        { label: text.items.home, icon: "House", route: "(tabs)" },
        { label: text.items.recurring, icon: "Repeat", route: "recurring" },
        { label: text.items.crypto, icon: "Bitcoin", route: "crypto" },
      ],
    },
    {
      title: text.sections.setup,
      items: [
        { label: text.items.categories, icon: "Tags", route: "categories" },
        { label: text.items.tags, icon: "Tag", route: "tags" },
      ],
    },
    {
      title: text.sections.system,
      items: [
        { label: text.items.settings, icon: "Settings", route: "settings" },
        { label: text.items.about, icon: "Info", route: "about" },
      ],
    },
  ]

  const navigate = (route: string) => {
    props.navigation.navigate(route)
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <DrawerContentScrollView
      className="flex-1 bg-background"
      {...props}
      contentContainerStyle={{ flex: 1 }}
    >
      <View className="flex-1">
        {/* App branding */}
        <View className="items-center pt-4 pb-2">
          <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center mb-2 overflow-hidden">
            <Image
              source={require("@/assets/images/wallet.png")}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-xl font-bold text-foreground">{appName}</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {text.tagline}
          </Text>
        </View>

        <View className="mx-4 my-2">
          <Divider />
        </View>

        {/* Navigation sections */}
        {sections.map((section) => (
          <View key={section.title}>
            <SectionHeader title={section.title} />
            {section.items.map((item) => (
              <DrawerMenuItem
                key={item.route}
                item={item}
                isActive={currentRoute === item.route}
                onPress={() => navigate(item.route)}
              />
            ))}
          </View>
        ))}

        {/* Spacer */}
        <View className="flex-1" />

        {/* User profile + logout at bottom */}
        <View className="mx-4 mt-2">
          <Divider />
        </View>

        <View className="px-4 pb-6 pt-3 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
            <Text className="text-sm font-bold text-primary-foreground">
              {initials}
            </Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {user?.name || text.guest}
            </Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {user?.email || ""}
            </Text>
          </View>
          <TouchableOpacity
            className="w-9 h-9 rounded-xl bg-destructive/10 items-center justify-center"
            onPress={logout}
            activeOpacity={0.7}
          >
            <Icon name="LogOut" size={16} className="text-destructive" />
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  )
}
