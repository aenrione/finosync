import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native"
import React, { useState, useRef } from "react"
import { useTranslation } from "react-i18next"

import { showAmount, amountStyle } from "@/utils/currency"
import { UserBalance } from "@/types/user"
import Icon from "@/components/ui/icon"


interface BalanceCardProps {
  userBalances: UserBalance[]
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  userBalances = [],
}) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(true)
  const CARD_WIDTH = Dimensions.get("window").width - 40
  const scrollViewRef = useRef<ScrollView>(null)
  const { t } = useTranslation()

  const renderCard = (item: UserBalance) => (
    <View key={item.currency} style={{ width: CARD_WIDTH }} className="px-5">
      <View className="flex-row justify-center items-center mb-2 mt-2">
        <Text className="font-semibold text-center">{item.currency}</Text>
        <TouchableOpacity onPress={() => setShowInfo(!showInfo)}>
          <Icon
            name={showInfo ? "EyeOff" : "Eye"}
            className="ml-5 "
          />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-center">
        <View className="p-5">
          <View className="px-5 pb-3">
            <Text className="text-xs  mb-2">{t("balance_card.my_balance")}</Text>
            <Text className={`${amountStyle(item.balance)}`}>
              {showAmount(item.balance, showInfo)}
            </Text>
          </View>

          <View className="border-b border-white" />

          <View className="px-5 pt-3">
            <Text className="text-xs  mb-2">{t("balance_card.returns")}</Text>
            <Text className={`${amountStyle(item.investments_return)}`}>
              {showAmount(item.investments_return, showInfo)}
            </Text>
          </View>
        </View>

        <View className="w-px bg-foreground/30 mx-1 h-full" />

        <View className="p-5">
          <View className="px-5 pb-3">
            <Text className="text-xs  mb-2">{t("balance_card.incomes")}</Text>
            <Text className={`${amountStyle(item.balance)}`}>
              {showAmount(item.income, showInfo)}
            </Text>
          </View>

          <View className="border-b border-white" />

          <View className="px-5 pt-3">
            <Text className="text-xs  mb-2">{t("balance_card.expenses")}</Text>
            <Text className={`${amountStyle(item.expense)}`}>
              {showAmount(item.expense, showInfo)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x
    const activeIndex = Math.round(xOffset / CARD_WIDTH)
    setActiveCardIndex(activeIndex)
  }

  return (
    <View className="rounded-2xl bg-background shadow-md my-5 overflow-hidden">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {userBalances.map((item) => renderCard(item))}
      </ScrollView>

      {userBalances.length > 1 && (
        <View className="flex-row justify-center items-end pb-2 mt-2">
          {userBalances.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                activeCardIndex === index ? "bg-primary" : "bg-foreground/30"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  )
}

export default BalanceCard

