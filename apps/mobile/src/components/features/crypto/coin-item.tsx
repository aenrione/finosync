import { View, Text, Image } from "react-native"
import React from "react"

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  // maximumFractionDigits: 1, // (causes 2500.99 to be printed as $2,501)
})

const CoinItem = ({ coin }) => (
  <View className="bg-card p-2.5 flex-row justify-between">
    <View className="flex-row">
      <Image source={{ uri: coin.image }} className="w-[30px] h-[30px]" />
      <View className="ml-2.5">
        <Text className="text-foreground">{coin.name}</Text>
        <Text className="text-muted-foreground uppercase">{coin.symbol}</Text>
      </View>
    </View>
    <View>
      <Text className="text-foreground font-bold">{formatter.format(coin.current_price)}</Text>
      <Text
        className={`text-right ${coin.price_change_percentage_24h > 0 ? "text-green-600" : "text-destructive"}`}
      >
        {coin.price_change_percentage_24h.toFixed(2)}%
      </Text>
    </View>
  </View>
)

export default CoinItem
