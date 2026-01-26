import React, { useState, useEffect } from "react"
import { View, ScrollView } from "react-native"
import { useMutation } from "react-query"
// import { showMessage } from 'react-native-flash-message';
import { useRouter } from "expo-router"
import axios from "axios"

import CustomButton from "@/components/CustomButton"
import CustomInput from "@/components/CustomInput"
import { Text } from "@/components/theme/Themed"

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
        <Text text="Set Quota" />
        <CustomInput placeholder="e.g: 100" value={String(quota)} 
          setValue={(text) => setQuota(Number(text))}
          keyboardType="numeric"
        />

        <CustomButton text="Submit" bgColor="green" onPress={onSubmit} />
      </View>
    </ScrollView>
  )
}

