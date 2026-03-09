import { View, FlatList } from "react-native"
import React, { useState } from "react"
import { useQuery } from "react-query"
import axios from "axios"

import ScreenHeader from "@/components/screen-header"
import { Spinner } from "@/components/ui/spinner"
import CoinItem from "@/components/features/crypto/coin-item"
import { Input } from "@/components/ui/input"

type CoinMarket = {
  id: string
  name: string
  symbol: string
  current_price: number
  market_cap: number
  price_change_percentage_24h: number
  image: string
}

const Crypto = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")

  const loadData = async function () {
    const { data: response } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",
    )
    return response
  }

  const { data: coins, status, refetch } = useQuery<CoinMarket[]>("crypto-market", loadData)

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader variant="drawer" title="Crypto Markets" />
      <View className="flex-row px-5 justify-end mb-2.5">
        <Input
          placeholder="Search a Coin"
          onChangeText={(text) => text && setSearch(text)}
          className="w-2/5 text-center border-b border-primary"
        />
      </View>

      {status !== "success" ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size="large" />
        </View>
      ) : (
        <FlatList
          className="px-5"
          data={coins.filter(
            (coin: CoinMarket) =>
              coin.name.toLowerCase().includes(search.toLocaleLowerCase()) ||
              coin.symbol.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
          )}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <CoinItem coin={item} />}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true)
            await refetch()
            setRefreshing(false)
          }}
        />
      )}
    </View>
  )
}

export default Crypto
