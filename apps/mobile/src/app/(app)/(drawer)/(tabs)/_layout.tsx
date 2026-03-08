import { useTranslation } from "react-i18next"
import { Tabs } from "expo-router"
import React from "react"

import { tabScreens } from "@/utils/screen-config"
import Icon from "@/components/ui/icon"

export default function Navitagion() {
  const { t } = useTranslation()
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = tabScreens.find(screen => screen.name === route.name)?.icon || "House"
          return <Icon name={iconName} />
        },
        tabBarInactiveTintColor: undefined,
      })}
    >
      {
        tabScreens.map(screen => (
          <Tabs.Screen
            key={screen.name}
            name={screen.name}
            options={{
              title: t(`navigation.${screen.name}`),
              headerShown: screen.headerShown == true,
            // tabBarLabel: screen.title,
            }}
          />
        ))
      }
    </Tabs>
  )
}

