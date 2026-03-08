import { View, FlatList } from "react-native"
import React, { useState } from "react"
import { useQuery } from "react-query"
import axios from "axios"

import { Spinner } from "@/components/ui/spinner"
import CoinItem from "@/components/features/crypto/coin-item"
import { Input } from "@/components/ui/input"

const Crypto = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")

  const loadData = async function () {
    const { data: response } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",
    )
    return response
  }

  const { data: coins, status, refetch } = useQuery("crypto-market", loadData)

  return (
    <View className="flex-1 items-center bg-background">
      <View className="flex-row w-[90%] justify-between mb-2.5">
        <View />
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
          className="w-[90%]"
          data={coins.filter(
            (coin: any) =>
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
