import { View, TextInput } from "react-native"
import React, { useState } from "react"

import { Button, ButtonText } from "@/components/ui/button"
import { ToBuyItem } from "@/types/to-buy"

type AddInputProps = {
  submitHandler: (data: ToBuyItem) => void
}

export default function AddInput({ submitHandler }: AddInputProps) {
  const [value, setValue] = useState("")
  const [price, setPrice] = useState("")

  const submit = () => {
    submitHandler({ title: value, price_amount: price })
    setValue("")
    setPrice("")
  }

  return (
    <View className="flex-col text-neutral-800">
      <View className="flex-row rounded-xl">
        <TextInput
          className="text-lg bg-card w-full p-3 mb-5 rounded-xl"
          placeholder="Item name"
          placeholderTextColor="hsl(var(--muted-foreground))"
          onChangeText={setValue}
          value={value}
        />
      </View>
      <View className="flex-row rounded-xl">
        <TextInput
          className="text-lg bg-card w-full p-3 mb-5 rounded-xl"
          placeholder="$ Price"
          placeholderTextColor="hsl(var(--muted-foreground))"
          onChangeText={setPrice}
          value={price}
        />
      </View>
      <Button onPress={submit}>
        <ButtonText>Submit</ButtonText>
      </Button>
    </View>
  )
}

