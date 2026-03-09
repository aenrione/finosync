import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { User, Mail, Lock, ShieldCheck } from "lucide-react-native"

import { registerUser } from "@/services/onboarding.service"
import { Button, ButtonText } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Spinner } from "@/components/ui/spinner"
import { Text } from "@/components/ui/text"

export default function SignUpScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  const isValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword

  const onSignUpPressed = async () => {
    setLoading(true)
    setError(null)
    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        passwordConfirmation: confirmPassword,
      })
      router.replace("/(app)/(onboarding)/welcome")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
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
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-14 h-14 rounded-xl bg-primary items-center justify-center mb-3">
              <Text className="text-xl font-bold text-white">F</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">
              Create your account
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Start managing your finances today
            </Text>
          </View>

          {/* Form */}
          <View className="bg-card rounded-xl p-5 border border-border">
            <FormField
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              icon={User}
              required
            />

            <FormField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              icon={Mail}
              required
            />

            <FormField
              label="Password"
              placeholder="Min. 6 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              icon={Lock}
              required
              helperText={
                password.length > 0 && password.length < 6
                  ? "Password must be at least 6 characters"
                  : undefined
              }
            />

            <FormField
              label="Confirm Password"
              placeholder="Re-enter your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon={ShieldCheck}
              required
              error={passwordMismatch ? "Passwords don't match" : undefined}
              containerClassName="mb-2"
            />

            {error ? (
              <Text className="text-sm text-error text-center mb-2">{error}</Text>
            ) : null}

            <Button
              disabled={!isValid || loading}
              onPress={onSignUpPressed}
              className="w-full mt-3"
              size="lg"
            >
              {loading ? <Spinner size="small" /> : <ButtonText size="lg">Create Account</ButtonText>}
            </Button>
          </View>

          {/* Link */}
          <View className="mt-6">
            <Button
              variant="ghost"
              onPress={() => router.navigate("/(auth)/sign-in")}
              className="w-full"
            >
              <ButtonText variant="ghost">
                Already have an account? Sign in
              </ButtonText>
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
