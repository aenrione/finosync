import React, { useState, useEffect } from "react"
import { View, ScrollView } from "react-native"
import { useMutation } from "react-query"
// import { showMessage } from 'react-native-flash-message';
import { useRouter } from "expo-router"
import axios from "axios"

import { Button, ButtonText } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"

type SetQuotaFormProps = {
  user_quota?: number;
};

export default function SetQuotaForm({user_quota}: SetQuotaFormProps) {
  const [quota, setQuota] = useState<number>(user_quota || 0)
  const router = useRouter()

  const setQuotaRequest = async function () {
    // const { data: response } = await axios.post('/api/v1/user/set_quota', {
    //   quota: quota,
    // });
    const response = { data: { success: true } } // Mock response for demonstration
    return response.data
  }
  const mutation = useMutation(setQuotaRequest)
  const { isSuccess, isError } = mutation

  const onSubmit = async () => {
    mutation.mutate()
  }

  useEffect(() => {
    if (isSuccess) {
      router.push("/(app)/(drawer)/(tabs)/dashboard")
      // showMessage({
      //   message: 'Success!',
      //   type: 'success',
      // });
      mutation.reset()
    }
    if (isError) {
      setQuota(0)
      mutation.reset()
    }
  }, [isSuccess, isError, mutation, router])

  return (
    <ScrollView>
      <View className="flex-1 items-center px-5 pt-2">
        <Text className="text-lg font-semibold">Set Quota</Text>
        <Input placeholder="e.g: 100" value={String(quota)}
          onChangeText={(text) => setQuota(Number(text))}
          keyboardType="numeric"
        />

        <Button onPress={onSubmit} className="mt-4">
          <ButtonText>Submit</ButtonText>
        </Button>
      </View>
    </ScrollView>
  )
}
