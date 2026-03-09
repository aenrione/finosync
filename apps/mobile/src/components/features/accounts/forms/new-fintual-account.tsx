import { View, ScrollView, ActivityIndicator } from "react-native"
// import { showMessage } from "react-native-flash-message"
import { useMutation } from "react-query"
import React, { useState } from "react"
import axios from "axios"

import { Button, ButtonText } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"

export default function NewFintualAccount({ refresh }: { refresh: () => void }) {
  const [email, setEmail] = useState("")
  const [passowrd, setPassword] = useState("")

  const postEntity = async function () {
    const { data: response } = await axios.post("/api/v1/fintual_accounts", {
      email: email,
      encrypted_password: passowrd,
    })
    return response.data
  }
  const mutation = useMutation(postEntity)
  const { isLoading, isSuccess } = mutation

  const onSubmit = async () => {
    mutation.mutate()
  }

  if (isSuccess) {
    // showMessage({
    //   message: "Exito!",
    //   type: "success",
    // })
    refresh()
  }

  return (
    <ScrollView>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View className="flex-1 items-center p-10">
          <Text className="text-xl font-bold mb-2.5">Create Fintual Account</Text>
          <Input placeholder="Email" value={email} onChangeText={setEmail} />
          <Input
            placeholder="Password"
            secureTextEntry
            value={passowrd}
            onChangeText={setPassword}
          />
          <Button onPress={onSubmit} className="mt-4">
            <ButtonText>Submit</ButtonText>
          </Button>
          <Button variant="ghost" className="mt-2">
            <ButtonText>Help</ButtonText>
          </Button>
        </View>
      )}
    </ScrollView>
  )
}
