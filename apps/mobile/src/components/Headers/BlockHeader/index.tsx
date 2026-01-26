import { Pressable, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"
import React from "react"

import { Text, View } from "@/components/theme/Themed"
import Icon from "@/components/ui/icon"
import { IconName } from "@/types/icon"

type BlockHeaderProps = {
  title: string
  noMargin?: boolean
  onPressKey?: string
  onPressIcon?: IconName
  onPress?: () => void
  onRefresh?: () => void
}

const BlockHeader = (props: BlockHeaderProps) => {
  const { t } = useTranslation()
  const { title, noMargin, onPress, onRefresh } = props

  return (
    <View
      className={`flex-row items-center justify-between ${
        noMargin ? "" : "mt-5"
      }`}
    >
      <Text className="text-xl">
        {title}
      </Text>

      <View className="flex flex-row">
        {onPress && (
          <Pressable className="flex-row items-center" onPress={onPress}>
            {
              props.onPressKey && (
                <Text className="text-sm text-gray-medium mr-1.5">
                  {t(`${props.onPressKey}`)}
                </Text>
              )
            }
            {props.onPressIcon && (
              <Icon name={props.onPressIcon} className="text-gray-medium h-6 w-6 mr-3" />
            )}
          </Pressable>
        )}
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} >
            <Icon name="RefreshCcw" className="text-gray-medium h-6 w-6 mr-1/5" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default BlockHeader

