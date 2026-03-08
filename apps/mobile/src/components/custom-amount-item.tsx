import { Pressable } from "react-native"
import React from "react"

import { Text } from "@/components/ui/text"
import { View } from "react-native"
import { IconName } from "@/types/icon"

import Icon from "@/components/ui/icon"


type CustomAmountProps = {
  text?: string
  value?: string | number
  onPress?: () => void
  number?: boolean
  hasIcon?: boolean
  icon?: IconName
  iconColor?: string
}

export default function CustomAmountItem({
  text = "",
  value = "",
  onPress,
  number = true,
  hasIcon = false,
  icon,
}: CustomAmountProps) {

  const pressItem = () => {
    if (onPress) {
      onPress()
    }
  }

  // const valueColor = value?.includes("-") ? "text-red-500" : "text-green-600"

  return (
    <Pressable onPress={pressItem} className="flex-row flex-wrap justify-between py-1.5 px-0 text-sm">
      <View className="flex-row w-[60%] mb-0.5">
        {hasIcon && (
          <Icon
            name={icon || "House"}
            className="mr-1 mt-0.5"
          />
        )}
        <Text
          className={`text-foreground ${hasIcon ? "ml-1 mt-0.5" : ""}`}
        >
          {text}:
        </Text>
      </View>
      {number ? (
        <Text
          className={`${hasIcon ? "mt-0.5" : ""} font-bold`}
        >
          {value}
        </Text>
      ) : (
        <Text className="font-bold text-foreground" >
          {value}
        </Text>
      )}
    </Pressable>
  )
}

