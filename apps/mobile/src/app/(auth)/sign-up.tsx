import { View, StyleSheet, ScrollView } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"

import CustomButton from "@/components/CustomButton"
import CustomInput from "@/components/CustomInput"
import { Text } from "@/components/theme/Themed"

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
    <ScrollView>
      <View style={styles.root}>
        <Text style={styles.title}> Create an account</Text>
        <CustomInput placeholder="Name" value={name} setValue={setName} />
        <CustomInput placeholder="Email" value={email} setValue={setEmail} />
        <CustomInput
          placeholder="Password"
          secureTextEntry
          value={password}
          setValue={setPassword}
        />
        <CustomInput
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          setValue={setConfirmPassword}
        />
        <CustomButton text="Register" onPress={onSignUpPressed} />

        {/* <CustomButton */}
        {/*   text="Sign in with Facebook" */}
        {/*   onPress={onSignInFacebook} */}
        {/*   bgColor="#E7EAF4" */}
        {/*   fgColor="#4765A9" */}
        {/* /> */}

        {/* <CustomButton */}
        {/*   text="Sign in with Google" */}
        {/*   onPress={onSignInGoogle} */}
        {/*   bgColor="#FAE9EA" */}
        {/*   fgColor="#DD4D44" */}
        {/* /> */}

        {/* <CustomButton */}
        {/*   text="Sign in with Apple" */}
        {/*   onPress={onSignInApple} */}
        {/*   bgColor="#e3e3e3" */}
        {/*   fgColor="#363636" */}
        {/* /> */}

        <CustomButton
          text="Already have an account? Sign in!"
          onPress={onSignInPressed}
          type="tertiary"
        />
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

