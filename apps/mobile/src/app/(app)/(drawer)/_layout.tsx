import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import React from "react";

import CustomDrawer from "@/components/features/layout/custom-drawer";
import { drawerScreens } from "@/utils/screen-config";
import Icon from "@/components/ui/icon";
import { useTranslation } from "@/locale/app/drawer/nav.text";
import { colors } from "@/lib/colors";

export default function Navitagion() {
  const text = useTranslation();
  const fallbackLabels: Record<string, string> = {
    "(tabs)": "Home",
    shopping: "Shopping Lists",
    tags: "Tags",
    recurring: "Recurring",
    categories: "Categories",
    crypto: "Crypto Markets",
    settings: "Settings",
    about: "About",
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: colors.primary,
          drawerActiveBackgroundColor: "#e6f7f7",
          drawerInactiveTintColor: colors.mutedForeground,
        }}
      >
        {drawerScreens.map((screen) => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
            options={{
              title:
                text.navigation[screen.name] ??
                fallbackLabels[screen.name] ??
                screen.name,
              drawerLabel:
                text.navigation[screen.name] ??
                fallbackLabels[screen.name] ??
                screen.name,
              headerShown: false,
              drawerIcon: () => <Icon name={screen.icon || "House"} />,
            }}
          />
        ))}
      </Drawer>
    </GestureHandlerRootView>
  );
}
