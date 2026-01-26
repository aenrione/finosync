import { View, StyleSheet, ScrollView } from "react-native"
import { useMutation } from "react-query"
import React, { useEffect } from "react"
import axios from "axios"

import CustomButton from "@/components/CustomButton"
// import { showMessage } from 'react-native-flash-message';

export default function CreateForm({  }) {
  const createList = async function () {
    const { data: response } = await axios.post("/api/v1/to_buy_lists", {
      title: "To Buy List",
    })
    return response.data
  }
  const mutation = useMutation(createList)
  const { isSuccess, isError } = mutation

  const onSubmit = async () => {
    mutation.mutate()
  }

  useEffect(() => {
    if (isSuccess) {
      // refetch()
      // showMessage({
      //   message: 'Exito!',
      //   type: 'success',
      // });
      mutation.reset()
    }
    if (isError) {
      mutation.reset()
    }
  })

  return (
    <ScrollView>
      <View style={styles.root}>
        <CustomButton text="Create To Buy List!" bgColor="green" onPress={onSubmit} />
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

