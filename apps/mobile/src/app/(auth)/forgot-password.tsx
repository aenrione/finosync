import { View, ScrollView } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"

import { Button, ButtonText } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"

export default function ForgotPasswordScreen() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const onSignUpPressed = () => {
    console.warn("Sign Up")
  }

  const onSignInPressed = () => {
    router.navigate("/sign-in")
  }

  return (
    <ScrollView className="bg-background">
      <View className="flex-1 items-center px-5 mt-7 gap-3">
        <Text className="text-xl font-bold mb-2">Reset your Password</Text>
        <Input placeholder="Username" value={username} onChangeText={setUsername} className="w-full" />
        <Input
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="w-full"
        />
        <Button onPress={onSignUpPressed} className="w-full mt-2">
          <ButtonText>Register</ButtonText>
        </Button>
        <Button variant="ghost" onPress={onSignInPressed} className="w-full">
          <ButtonText variant="ghost">Back to Sign in</ButtonText>
        </Button>
      </View>
    </ScrollView>
  )
}
