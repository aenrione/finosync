import { Tabs } from "expo-router";
import React from "react";

import { tabScreens } from "@/utils/screen-config";
import Icon from "@/components/ui/icon";
import { useTranslation } from "@/locale/app/drawer/tabs.text";
import { colors } from "@/lib/colors";

export default function Navitagion() {
  const text = useTranslation();
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName =
            tabScreens.find((screen) => screen.name === route.name)?.icon ||
            "House";
          return (
            <Icon
              name={iconName}
              size={22}
              className={focused ? "text-primary" : "text-muted-foreground"}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          height: 64,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      })}
    >
      {tabScreens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: text.navigation[screen.name],
            headerShown: screen.headerShown == true,
            // tabBarLabel: screen.title,
          }}
        />
      ))}
      {/* Hide legacy routes from tab bar */}
      <Tabs.Screen name="charts" options={{ href: null }} />
    </Tabs>
  );
}
