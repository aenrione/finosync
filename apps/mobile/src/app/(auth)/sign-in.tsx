import { View, ScrollView } from "react-native"
import React, { useState, useEffect } from "react"
import { useTranslation } from "@/locale/auth/sign-in.text"
import { useRouter } from "expo-router"

import { checkSession } from "@/services/auth.service"
import { Button, ButtonText } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { Spinner } from "@/components/ui/spinner"
import { login } from "@/services/auth.service"
import { useStore } from "@/utils/store"


export function SignInScreen() {
  const text = useTranslation()
  const url = useStore((state) => state.url)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currentUrl, setUrl] = useState(url)
  const [buttonStatus, setButtonStatus] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
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
    setLoginError(null)
    const result = await login(email, password)
    if (!result.success) {
      setLoginError(result.error || "Login failed. Please check your credentials.")
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
        <Text className="text-3xl font-bold text-primary">FinoSync</Text>
        <Spinner className="mt-4" />
      </View>
    )
  }

  return (
    <ScrollView className="bg-background" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 items-center justify-center px-6 py-12 gap-4">
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-primary">FinoSync</Text>
          <Text className="text-sm text-muted-foreground mt-2">Your personal finance hub</Text>
        </View>

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
          <ButtonText>{text.signIn}</ButtonText>
        </Button>

        {loginError && (
          <Text className="text-sm text-destructive text-center">{loginError}</Text>
        )}

        {(currentUrl === "https://" || currentUrl === "") && (
          <Text className="text-sm text-destructive">Server URL can't be empty</Text>
        )}

        <Button variant="ghost" onPress={onNoAccountPressed} className="w-full">
          <ButtonText variant="ghost">{text.noAccount}</ButtonText>
        </Button>
        <Button variant="ghost" onPress={onForgotPasswordPressed} className="w-full">
          <ButtonText variant="ghost" className="text-muted-foreground">{text.forgotPassword}</ButtonText>
        </Button>
      </View>

      <View className="items-center pb-8 gap-1">
        <Text className="text-xs text-muted-foreground">Server URL</Text>
        <Button variant="ghost" onPress={updateUrl}>
          <ButtonText variant="ghost" className="text-xs text-primary">{currentUrl}</ButtonText>
        </Button>
      </View>
    </ScrollView>
  )
}

export default SignInScreen
