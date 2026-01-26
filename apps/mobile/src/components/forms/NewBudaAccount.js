import { Text, View, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
// import { showMessage } from "react-native-flash-message"
import { useMutation } from "react-query"
import React, { useState } from "react"
import axios from "axios"

import CustomButton from "@/components/CustomButton"
import CustomInput from "@/components/CustomInput"

export default function NewBudaAccount({ refresh }) {
  const [api_secret, setSecret] = useState("")
  const [api_key, setKey] = useState("")

  const postEntity = async function () {
    const { data: response } = await axios.post("/api/v1/buda_accounts", {
      api_key: api_key,
      encrypted_password: api_secret,
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
        <View style={styles.root}>
          <Text style={styles.title}>Create Buda Account</Text>
          <CustomInput placeholder="Api key" secureTextEntry value={api_key} setValue={setKey} />
          <CustomInput
            placeholder="Api secret"
            secureTextEntry
            value={api_secret}
            setValue={setSecret}
          />
          <CustomButton text="Submit" onPress={onSubmit} />
          <CustomButton text="Help" type="tertiary" />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    padding: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
})
