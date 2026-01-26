import { Text, View, StyleSheet, ScrollView } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"

import CustomButton from "@/components/CustomButton"
import CustomInput from "@/components/CustomInput"

export default function ForgotPasswordScreen() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const onSignUpPressed = () => {
    console.warn("Sign Up")
  }

  // const onForgotPasswordPressed = () => {
  //   console.warn('Forgot Password pressed');
  // };

  const onSignInPressed = () => {
    router.navigate("/sign-in")
  }

  return (
    <ScrollView>
      <View style={styles.root}>
        <Text style={styles.title}>Reset your Password</Text>
        <CustomInput placeholder="Username" value={username} setValue={setUsername} />
        <CustomInput
          placeholder="Password"
          secureTextEntry
          value={password}
          setValue={setPassword}
        />
        <CustomButton text="Register" onPress={onSignUpPressed} />
        <CustomButton text="Back to Sign in" onPress={onSignInPressed} type="tertiary" />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    marginTop: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
})

