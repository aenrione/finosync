import { DrawerContentScrollView } from "@react-navigation/drawer";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { View, TouchableOpacity, Image } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { appName } from "@/constants/config";
import { useCharts } from "@/context/charts.context";
import { useStore } from "@/utils/store";
import Icon from "@/components/ui/icon";
import { IconName } from "@/types/icon";
import { Divider } from "@/components/ui/card";
import { colors } from "@/lib/colors";

import { useTranslation } from "./_texts/text";

const TIME_RANGES = ["1M", "3M", "6M", "1Y"];

type DrawerItem = {
  label: string;
  icon: IconName;
  route: string;
};

type DrawerSection = {
  title: string;
  items: DrawerItem[];
};

function SectionHeader({ title, first }: { title: string; first?: boolean }) {
  return (
    <Text className={`text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground px-4 ${first ? "pt-2" : "pt-5"} pb-2`}>
      {title}
    </Text>
  );
}

function DrawerMenuItem({
  item,
  isActive,
  onPress,
}: {
  item: DrawerItem;
  isActive: boolean;
  onPress: () => void;
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
          name={item.icon}
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
  );
}

export default function CustomDrawerContent(
  props: DrawerContentComponentProps,
) {
  const logout = useStore((state) => state.logout);
  const user = useStore((state) => state.user);
  const { timeRange, setTimeRange } = useCharts();
  const text = useTranslation();
  const insets = useSafeAreaInsets();

  const currentRoute = props.state.routes[props.state.index]?.name;

  const sections: DrawerSection[] = [
    {
      title: text.sections.main,
      items: [
        { label: text.items.home || "Home", icon: "House", route: "(tabs)" },
        {
          label: text.items.shopping || "Shopping Lists",
          icon: "ShoppingCart",
          route: "shopping",
        },
        {
          label: text.items.recurring || "Recurring",
          icon: "Repeat",
          route: "recurring",
        },
        {
          label: text.items.crypto || "Crypto Markets",
          icon: "Bitcoin",
          route: "crypto",
        },
      ],
    },
    {
      title: text.sections.setup,
      items: [
        {
          label: text.items.categories || "Categories",
          icon: "Tags",
          route: "categories",
        },
        {
          label: text.items.rules || "Rules",
          icon: "SlidersHorizontal",
          route: "rules",
        },
        { label: text.items.tags || "Tags", icon: "Tag", route: "tags" },
      ],
    },
    {
      title: text.sections.system,
      items: [
        {
          label: text.items.settings || "Settings",
          icon: "Settings",
          route: "settings",
        },
        { label: text.items.about || "About", icon: "Info", route: "about" },
        {
          label: text.items.feedback || "Feedback",
          icon: "MessageSquare",
          route: "feedback",
        },
      ],
    },
  ];

  const navigate = (route: string) => {
    props.navigation.navigate(route);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="items-center px-4 pt-4 pb-2">
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

      <DrawerContentScrollView
        {...props}
        className="flex-1"
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Global time range */}
        <View className="pb-1">
          <SectionHeader title={text.timeRange || "Time Range"} first />
          <View className="flex-row gap-1.5 rounded-full bg-card border border-border p-1 mx-4">
            {TIME_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                className={`flex-1 items-center py-1.5 rounded-full ${timeRange === range ? "bg-primary" : "bg-transparent"}`}
                onPress={() => setTimeRange(range)}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs font-semibold ${timeRange === range ? "text-white" : "text-muted-foreground"}`}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
      </DrawerContentScrollView>

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
          <Text
            className="text-sm font-semibold text-foreground"
            numberOfLines={1}
          >
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
  );
}
