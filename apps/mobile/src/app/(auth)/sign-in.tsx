import { View, Image, ScrollView } from "react-native"
import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "expo-router"

import { checkSession } from "@/services/auth.service"
import { Button, ButtonText } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { login } from "@/services/auth.service"
import Logo from "@/assets/images/wallet.png"
import { useStore } from "@/utils/store"


export function SignInScreen() {
  const {t} = useTranslation()
  const url = useStore((state) => state.url)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currentUrl, setUrl] = useState(url)
  const [buttonStatus, setButtonStatus] = useState(false)
  const { setUrl: setStoreUrl } = useStore.getState()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      const user = await checkSession()
      if (user) {
        router.replace("/(app)/(drawer)/(tabs)/dashboard")
      }
      setIsLoading(false)
    }
    init()

  }, [router])

  useEffect(() => {
    setUrl(url)
    if (url === "https://" || url === "") {
      setButtonStatus(false)
    }
  }, [url])

  useEffect(() => {
    if (email === "" || password === "") {
      setButtonStatus(false)
    } else {
      setButtonStatus(true)
    }
  }, [email, password])

  const onSignInPressed = async function () {
    const result = await login(email, password)
    if (!result.success) {
      console.warn(result.error)
    }
  }

  const onNoAccountPressed = function () {
    router.navigate("/sign-up")
  }

  const updateUrl = async () => {
    setStoreUrl(currentUrl)
    if (router) router.navigate("/(auth)/settings")
  }

  const onForgotPasswordPressed = () => {
    router.navigate("/forgot-password")
  }

  const onSignUpPressed = () => {
    if (router) router.navigate("/(auth)/sign-up")
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Image source={Logo} className="w-[70%] h-20 max-w-[300px] max-h-[200px]" resizeMode="contain" />
      </View>
    )
  }

  return (
    <ScrollView className="bg-background">
      <View className="flex-1 items-center px-4 pt-5 gap-3">
        <Image
          source={Logo}
          className="w-[70%] max-w-[300px] max-h-[200px] my-2"
          resizeMode="contain"
        />
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          className="w-full"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={onSignInPressed}
          className="w-full"
        />
        <Button disabled={!buttonStatus} onPress={onSignInPressed} className="w-full mt-2">
          <ButtonText>{t("signin_view.sign_in")}</ButtonText>
        </Button>
        {(currentUrl === "https://" || currentUrl === "") && (
          <Text className="text-sm text-destructive">Server URL can't be empty</Text>
        )}

        <Button variant="ghost" onPress={onNoAccountPressed} className="w-full">
          <ButtonText variant="ghost">{t("signin_view.no_account")}</ButtonText>
        </Button>
        <Button variant="ghost" onPress={onForgotPasswordPressed} className="w-full">
          <ButtonText variant="ghost" className="text-muted-foreground">{t("signin_view.forgot_password")}</ButtonText>
        </Button>
      </View>
      <View className="items-center mt-6 gap-1">
        <Text className="text-sm text-muted-foreground">Server URL</Text>
        <Button variant="ghost" onPress={updateUrl}>
          <ButtonText variant="ghost" className="text-sm text-primary">{currentUrl}</ButtonText>
        </Button>
      </View>
    </ScrollView>
  )
}

export default SignInScreen
