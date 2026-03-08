import { View, ScrollView } from "react-native"
import { useMutation } from "react-query"
import React, { useEffect } from "react"
import axios from "axios"

import { Button, ButtonText } from "@/components/ui/button"
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
      <View className="flex-1 items-center p-5 mt-8">
        <Button onPress={onSubmit}>
          <ButtonText>Create To Buy List!</ButtonText>
        </Button>
      </View>
    </ScrollView>
  )
}
