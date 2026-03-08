import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer"
import { DrawerContentComponentProps } from "@react-navigation/drawer"
import { SafeAreaView } from "react-native-safe-area-context"
import { View, Image } from "react-native"
import React from "react"

import { Button, ButtonText } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import Logo from "@/assets/images/wallet.png"
import { appName } from "@/constants/config"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"

import { useTranslation } from "./_texts/text"

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const logout = useStore((state) => state.logout)
  const text = useTranslation()

  return (
    <DrawerContentScrollView className="flex-1 bg-background" {...props}>
      <View className="h-36 w-4/5 mt-5 mb-16 self-center">
        <Image
          source={Logo}
          className="w-full h-full max-w-[250px] max-h-[100px]"
          resizeMode="contain"
        />
        <Text className="text-center text-[30px] w-full">
          {appName}
        </Text>
      </View>

      <SafeAreaView className="flex-1 px-4">
        <View>
          <DrawerItemList {...props} />
        </View>

        <View className="mt-0 w-[100px] flex-row">
          <Button
            variant="ghost"
            className="mt-[87%]"
            onPress={logout}
          >
            <Icon
              name="LogOut"
            />
            <ButtonText className="text-[16px]"> {text.logout}</ButtonText>
          </Button>

        </View>
      </SafeAreaView>
    </DrawerContentScrollView>
  )
}
