import { useTranslation } from "react-i18next"
import {
  Dimensions
} from "react-native"
import React from "react"

import { formatCurrency, curStyle } from "@/utils/currency"
import { Text, View } from "@/components/theme/Themed"
import Icon from "@/components/ui/icon"
const PieCard = ({ incomes, expenses, width, currency }) => {
  const { t } = useTranslation()
  const selWidth = width || Dimensions.get("window").width
  const amount = incomes + expenses

  const payoutPercent =
    incomes === 0 && expenses === 0
      ? 0
      : incomes === 0
        ? 100
        : Math.abs((expenses / incomes) * 100).toFixed(2)

  const savedPercent =
    incomes === 0 && expenses === 0 ? 0 : (100 - payoutPercent).toFixed(2)

  return (
    <View>
      {currency && (
        <Text className="text-xl font-semibold text-white text-center mt-2.5">
          {currency}
        </Text>
      )}
      {amount !== 0 && (
        <Text
          className={`text-xl font-semibold text-center mt-1 ${curStyle(amount).colorClass}`}
        >
          {formatCurrency(amount, currency)}
        </Text>
      )}

      <View
        className="mt-2.5 rounded-2xl bg-gray-darker items-center"
        style={{ width: selWidth }}
      >
        {/* PieChart can be inserted in this container */}
        <View className="p-4">{/* Insert PieChart here */}</View>

        {/* Labels */}
        <View className="flex-1 px-4 pt-0 pb-4 justify-center">
          <View className="flex-row items-center my-1.5">
            <Icon name="Circle"/>
            <Text className="ml-1.5 text-sm text-gray-thin">
              {t("saved")} ({savedPercent}%)
            </Text>
          </View>

          <View className="flex-row items-center my-1.5">
            <Icon name="Circle"/>
            <Text className="ml-1.5 text-sm text-gray-thin">
              {t("transaction_view.expenses")} ({payoutPercent}%)
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PieCard

