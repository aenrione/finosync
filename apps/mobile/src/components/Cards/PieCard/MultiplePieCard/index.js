import Icon from "react-native-vector-icons/FontAwesome5"
import { View, Text, Dimensions } from "react-native"
import { useTranslation } from "react-i18next"
import Pie from "react-native-pie"
import React from "react"

import { formatCurrency, curStyle } from "@/utils/currency"

const PieChart = ({ data, currency, width, amount }) => {
  const radius = 65
  const selWidth = width || Dimensions.get("window").width
  const strokeWidth = 14
  const { t } = useTranslation()

  if (!data) return null

  return (
    <View>
      {currency && (
        <Text className="text-white text-center mt-2 text-lg">
          {currency}
        </Text>
      )}
      {formatCurrency(amount, currency) && (
        <Text className="text-center mt-1 text-lg">
          {formatCurrency(amount, currency)}
        </Text>
      )}
      <View className="bg-gray-darker rounded-2xl mt-2 items-center" style={{ width: selWidth }}>
        <View className="p-4">
          <View className="w-[140px] h-[140px] justify-center items-center">
            <Pie
              radius={radius}
              innerRadius={radius - strokeWidth}
              sections={data.map((obj) => ({
                percentage: obj.percentage,
                color: obj.color,
              }))}
              dividerSize={6}
              strokeCap={"butt"}
              backgroundColor="#1C1C1E" // fallback for Colors.GRAY_DARKER
            />
          </View>
        </View>
        <View className="flex-1 px-3 pt-1 items-start justify-start">
          {data.map((obj, index) =>
            obj.percentage > 0 ? (
              <View key={index} className="flex-row items-center my-1">
                <Icon name={obj.icon ?? "circle-notch"} size={15} color={obj.color} />
                <Text className="ml-2 text-gray-thin text-base">
                  {obj.label_name === "uncategorized" ? t(obj.label_name) : obj.label_name} ({obj.percentage.toFixed(2)}%)
                </Text>
              </View>
            ) : null
          )}
        </View>
      </View>
    </View>
  )
}

export default PieChart
