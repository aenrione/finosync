import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { Mail, Lock } from "lucide-react-native"

import { Button, ButtonText } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Text } from "@/components/ui/text"

export default function ForgotPasswordScreen() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const isValid = username.trim().length > 0 && password.length >= 6

  const onResetPressed = () => {
    console.warn("Sign Up")
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="bg-background"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-14 h-14 rounded-xl bg-primary/10 items-center justify-center mb-3">
              <Lock size={24} color="#4F46E5" />
            </View>
            <Text className="text-2xl font-bold text-foreground">
              Reset Password
            </Text>
            <Text className="text-sm text-muted-foreground mt-1 text-center px-4">
              Enter your username and new password below
            </Text>
          </View>

          {/* Form */}
          <View className="bg-card rounded-xl p-5 border border-border">
            <FormField
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              icon={Mail}
              required
            />

            <FormField
              label="New Password"
              placeholder="Min. 6 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              icon={Lock}
              required
              containerClassName="mb-2"
            />

            <Button
              disabled={!isValid}
              onPress={onResetPressed}
              className="w-full mt-3"
              size="lg"
            >
              <ButtonText size="lg">Reset Password</ButtonText>
            </Button>
          </View>

          {/* Link */}
          <View className="mt-6">
            <Button
              variant="ghost"
              onPress={() => router.navigate("/sign-in")}
              className="w-full"
            >
              <ButtonText variant="ghost">Back to Sign in</ButtonText>
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
