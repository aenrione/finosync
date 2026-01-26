import { ScrollView, Dimensions, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent } from "react-native"
import React, { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "expo-router"

import { showAmount, amountStyle } from "@/utils/currency"
import { Text, View } from "@/components/theme/Themed"
import { Account } from "@/types/account"
import Icon from "@/components/ui/icon"

type AccountCarouselProps = {
  accounts: Account[]
  offset?: number
}

const AccountCarousel = (props: AccountCarouselProps) => {
  const [containerWidth, setContainerWidth] = useState(Dimensions.get("window").width)
  const accountTotals = props.accounts || []
  const offset = 2 * (props.offset || 0)

  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(true)
  const CARD_WIDTH = Dimensions.get("window").width - offset
  const scrollViewRef = useRef(null)
  const { t } = useTranslation()
  const router = useRouter()

  const handleAccountPress = (account: Account) => {
    router.push({
      pathname: "/account/[id]",
      params: { id: account.id.toString() }
    })
  }

  const renderCard = (item: Account, containerWidth: number) => (
    <View key={item.id} className="w-full px-5" style={{ width: containerWidth }}>
      <TouchableOpacity 
        onPress={() => handleAccountPress(item)}
        activeOpacity={0.7}
        className="p-5 rounded-xl bg-background border border-border shadow-sm active:bg-muted/50 active:scale-95"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Top Amount + Eye Icon */}
        <View className="flex-row items-center pb-1 justify-between">
          <Text className={`text-2xl font-bold ${amountStyle(item.balance)}`}>
            {showAmount(item.balance, showInfo)}
          </Text>
          <TouchableOpacity 
            onPress={() => setShowInfo(!showInfo)} 
            className="ml-4 p-2 rounded-full active:bg-muted"
          >
            <Icon name={showInfo ? "EyeOff" : "Eye"} />
          </TouchableOpacity>
        </View>

        {/* Account + Holder Info */}
        <Text className="text-sm">{t("account_card.account")}: 
          <Text className="text-primary-light"> {item.account_name}</Text>
        </Text>

        {item.holder_name && (
          <Text className="text-sm">{t("account_card.holder")}:
            <Text className="text-gray-300"> {item.holder_name}</Text>
          </Text>
        )}

        {item.refreshed_at && (
          <Text className="text-sm">
            {t("account_card.refreshed")}: {item.refreshed_at}
          </Text>
        )}

        <View className="my-5 border-b border-foreground/10" />

        {/* Amounts */}
        <View className="flex-row justify-center">
          {
            item.income && (
              <View className="px-2 pb-2">
                <Text className="text-sm mb-2">{t("transaction_view.incomes")}</Text>
                <Text className={`${amountStyle(item.income)}`}>
                  {showAmount(item.income, showInfo)}
                </Text>
              </View>
            )
          }
          {
            item.expense && (
              <View className="px-2 pb-2">
                <Text className="text-sm mb-2">{t("transaction_view.expenses")}</Text>
                <Text className={`${amountStyle(item.expense)}`}>
                  {showAmount(item.expense, showInfo)}
                </Text>
              </View>
            )
          }
          {
            item.investment_return && (
              <View className="px-2 pb-2">
                <Text className="text-sm mb-2">{t("account_card.returns")}</Text>
                <Text className={`${amountStyle(item.investment_return)}`}>
                  {showAmount(item.investment_return, showInfo)}
                </Text>
              </View>
            )
          }
        </View>
      </TouchableOpacity>
    </View>
  )

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x
    const activeIndex = Math.round(xOffset / containerWidth)
    setActiveCardIndex(activeIndex)
  }

  return (
    <View className="rounded-2xl bg-background shadow-md overflow-hidden w-full" onLayout={
      (event) => {
        const width = event.nativeEvent.layout.width
        setContainerWidth(width)
      }
    }>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {accountTotals.map((item, _index) => renderCard(item, containerWidth))}
      </ScrollView>

      {accountTotals.length > 1 && (
        <View className="flex-row justify-center items-end pb-2">
          {accountTotals.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 mx-1 rounded-full ${activeCardIndex === index ? "bg-primary" : "bg-foreground/30"}`}
            />
          ))}
        </View>
      )}
    </View>
  )
}

export default AccountCarousel

