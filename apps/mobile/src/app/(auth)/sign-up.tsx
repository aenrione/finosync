import { View, ScrollView } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"

import { Button, ButtonText } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"

export default function SignUpScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  const onSignUpPressed = () => {
    // store.dispatch(registerUser({ name, email, password, confirmPassword }));
  }

  const onSignInPressed = () => {
    router.navigate("/(auth)/sign-in")
  }

  return (
    <ScrollView className="bg-background">
      <View className="flex-1 items-center px-5 mt-7 gap-3">
        <Text className="text-xl font-bold mb-2">Create an account</Text>
        <Input placeholder="Name" value={name} onChangeText={setName} className="w-full" />
        <Input placeholder="Email" value={email} onChangeText={setEmail} className="w-full" keyboardType="email-address" autoCapitalize="none" />
        <Input
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="w-full"
        />
        <Input
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          className="w-full"
        />
        <Button onPress={onSignUpPressed} className="w-full mt-2">
          <ButtonText>Register</ButtonText>
        </Button>

        <Button variant="ghost" onPress={onSignInPressed} className="w-full">
          <ButtonText variant="ghost">Already have an account? Sign in!</ButtonText>
        </Button>
      </View>
    </ScrollView>
  )
}
