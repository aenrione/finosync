import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useTranslation } from "react-i18next"
import {Drawer} from "expo-router/drawer"
import React from "react"

import CustomDrawer from "@/components/features/layout/custom-drawer"
import { drawerScreens } from "@/utils/screen-config"
import Icon from "@/components/ui/icon"



export default function Navitagion() {
  const { t } = useTranslation()
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
      >
        {
          drawerScreens.map((screen) => (
            <Drawer.Screen
              key={screen.name}
              name={screen.name}
              options={{
                title: t(`navigation.${screen.name}`),
                drawerIcon: () => <Icon name={screen.icon || "House"} />,
              }}
            />
          ))
        }
      </Drawer>
    </GestureHandlerRootView>
  )
}

