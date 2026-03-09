import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import React, { useState, useEffect } from "react"
import { useTranslation } from "@/locale/auth/sign-in.text"
import { useRouter } from "expo-router"
import { Mail, Lock, Server } from "lucide-react-native"

import { checkSession } from "@/services/auth.service"
import { Button, ButtonText } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Text } from "@/components/ui/text"
import { Spinner } from "@/components/ui/spinner"
import { login } from "@/services/auth.service"
import { useStore } from "@/utils/store"
import { colors } from "@/lib/colors"

export function SignInScreen() {
  const text = useTranslation()
  const url = useStore((state) => state.url)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currentUrl, setUrl] = useState(url)
  const [loginError, setLoginError] = useState<string | null>(null)
  const { setUrl: setStoreUrl } = useStore.getState()
  const router = useRouter()

  const buttonEnabled = email.length > 0 && password.length > 0 &&
    currentUrl !== "https://" && currentUrl !== ""

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      const user = await checkSession()
      if (user) {
        if (!user.onboarding_completed) {
          router.replace("/(app)/(onboarding)/welcome")
        } else {
          router.replace("/(app)/(drawer)/(tabs)/dashboard")
        }
      }
      setIsLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    setUrl(url)
  }, [url])

  const onSignInPressed = async function () {
    setLoginError(null)
    const result = await login(email, password)
    if (!result.success) {
      setLoginError(result.error || "Login failed. Please check your credentials.")
    }
  }

  const updateUrl = async () => {
    setStoreUrl(currentUrl)
    if (router) router.navigate("/(auth)/settings")
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
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="bg-background"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Brand header */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-xl bg-primary items-center justify-center mb-4">
              <Text className="text-2xl font-bold text-white">F</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground">FinoSync</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Your personal finance hub
            </Text>
          </View>

          {/* Form */}
          <View className="bg-card rounded-xl p-5 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-5">
              {text.signIn}
            </Text>

            <FormField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              icon={Mail}
              error={loginError && email ? " " : undefined}
            />

            <FormField
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={onSignInPressed}
              icon={Lock}
              error={loginError || undefined}
              containerClassName="mb-2"
            />

            <Button
              disabled={!buttonEnabled}
              onPress={onSignInPressed}
              className="w-full mt-3"
              size="lg"
            >
              <ButtonText size="lg">{text.signIn}</ButtonText>
            </Button>
          </View>

          {/* Links */}
          <View className="mt-6 gap-2">
            <Button
              variant="ghost"
              onPress={() => router.navigate("/sign-up")}
              className="w-full"
            >
              <ButtonText variant="ghost">{text.noAccount}</ButtonText>
            </Button>
            <Button
              variant="ghost"
              onPress={() => router.navigate("/forgot-password")}
              className="w-full"
            >
              <ButtonText variant="ghost" className="text-muted-foreground text-sm">
                {text.forgotPassword}
              </ButtonText>
            </Button>
          </View>
        </View>

        {/* Server URL footer */}
        <View className="items-center pb-8 gap-1">
          <Text className="text-xs text-muted-foreground">Server URL</Text>
          <Button variant="ghost" onPress={updateUrl} size="sm">
            <Server size={12} color={colors.primary} />
            <ButtonText variant="ghost" className="text-xs text-primary ml-1">
              {currentUrl}
            </ButtonText>
          </Button>
          {(currentUrl === "https://" || currentUrl === "") && (
            <Text className="text-xs text-error">Server URL can't be empty</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SignInScreen
