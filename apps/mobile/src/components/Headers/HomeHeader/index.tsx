import { Picker } from "@react-native-picker/picker"
import { TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"
import { useRouter } from "expo-router"
import { cssInterop } from "nativewind"
import React from "react"

import { Text, View } from "@/components/theme/Themed"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"
import { Typography } from "@/styles"

cssInterop(Picker, {
  className: {
    target: "style",
  },
})

type timeOptionType = {
  name: "month" | "week" | "all"
  value: "monthly" | "weekly" | "all"
}

const timeOptions: timeOptionType[] = [
  { name: "month", value: "monthly" },
  { name: "week", value: "weekly" },
  { name: "all", value: "all" },
]

type HomeHeaderProps = {
  filter?: timeOptionType
}

const HomeHeader = (_props: HomeHeaderProps) => {
  const filter = timeOptions[0]
  const user = useStore((state) => state.user)
  const { t } = useTranslation()
  const router = useRouter()

  const changeFilter = (value: timeOptionType) => {
    console.log("Filter changed to:", value)
  }

  if (!user) {
    return null
  }

  return (
    <View className="items-end">
      <View className="flex-row justify-between items-center px-5 pb-0 w-full">
        <View className="">
          <Text className="text-lg">
            {t("greeting")},
          </Text>
          <Text className="text-2xl">
            {user.name}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/(app)/notifications")}
        >
          <Icon name="Bell" className="text-foreground"/>
        </TouchableOpacity>
      </View>

      <Picker
        selectedValue={filter}
        onValueChange={(itemValue, _itemIndex) => changeFilter(itemValue)}
        style={{
          marginRight: 7,
          width: "40%",
          color: "#84b9ff",
        }}
        dropdownIconColor="#7A7A7A"
        itemStyle={[Typography.BODY, { color: "#A1A1A1" }]} // Colors.GRAY_THIN
      >
        {timeOptions.map((type, index) => (
          <Picker.Item
            key={index}
            label={t(type.name).toUpperCase()}
            value={type}
          />
        ))}
      </Picker>
    </View>
  )
}

export default HomeHeader

