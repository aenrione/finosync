import { View, ScrollView, ActivityIndicator } from "react-native"
// import { showMessage } from "react-native-flash-message"
import { useMutation } from "react-query"
import React, { useState } from "react"
import axios from "axios"

import { Button, ButtonText } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"

export default function NewFintocAccount({ refresh }) {
  const [api_key, setKey] = useState("")
  const [link, setLink] = useState("")

  const postEntity = async function () {
    const { data: response } = await axios.post("/api/v1/fintoc_accounts", {
      link: link,
      encrypted_password: api_key,
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
          <Text className="text-xl font-bold mb-2.5">Create Fintoc Account</Text>
          <Input placeholder="Link" secureTextEntry value={link} onChangeText={setLink} />
          <Input placeholder="Api key" secureTextEntry value={api_key} onChangeText={setKey} />
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
