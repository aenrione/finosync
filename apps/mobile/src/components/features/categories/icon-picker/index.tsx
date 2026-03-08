import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { useTranslation } from "react-i18next"
import Modal from "react-native-modal"
import React from "react"

import { IconName } from "@/types/icon"

import { iconData } from "./icon-list"
import Icon from "@/components/ui/icon"

type IconPickerProps = {
  onSelectIcon: (iconName: IconName) => void
  isVisible: boolean
  onClose: () => void
}

const IconPicker = ({ onSelectIcon, isVisible, onClose }:IconPickerProps) => {
  const { t } = useTranslation()

  const handleIconPress = (iconName: IconName) => {
    onSelectIcon(iconName)
    onClose()
  }

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View className="flex items-center justify-center">
        <ScrollView contentContainerClassName="flex-row flex-wrap justify-center bg-card p-5 rounded-xl">
          {iconData.map((icon: IconName, index: number) => (
            <TouchableOpacity
              key={index}
              className="items-center m-2"
              onPress={() => handleIconPress(icon)}
            >
              <Icon name={icon} />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          className="bg-muted px-4 py-2 rounded mt-2"
          onPress={onClose}
        >
          <Text className="text-foreground text-base">{t("cancel")}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

export default IconPicker

