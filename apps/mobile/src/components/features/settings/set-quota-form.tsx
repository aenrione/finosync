import React, { useState, useEffect } from "react"
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { useMutation } from "react-query"
import { useRouter } from "expo-router"
import { DollarSign } from "lucide-react-native"

import { Button, ButtonText } from "@/components/ui/button"
import { MoneyInput } from "@/components/ui/money-input"
import { FormSection } from "@/components/ui/form-section"
import { Text } from "@/components/ui/text"

type SetQuotaFormProps = {
  user_quota?: number;
};

export default function SetQuotaForm({user_quota}: SetQuotaFormProps) {
  const [quota, setQuota] = useState<string>(user_quota ? String(user_quota) : "")
  const router = useRouter()

  const setQuotaRequest = async function () {
    const response = { data: { success: true } }
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
      mutation.reset()
    }
    if (isError) {
      setQuota("")
      mutation.reset()
    }
  }, [isSuccess, isError, mutation, router])

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-5 pt-4">
          <FormSection title="Monthly Budget" description="Set your monthly spending limit to track your budget.">
            <MoneyInput
              label="Quota Amount"
              placeholder="e.g: 100"
              value={quota}
              onChangeValue={setQuota}
              icon={DollarSign}
              required
              containerClassName="mb-2"
            />

            <Button onPress={onSubmit} className="w-full" size="lg">
              <ButtonText size="lg">Set Quota</ButtonText>
            </Button>
          </FormSection>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
