import { View, StyleSheet, StatusBar, FlatList, TextInput } from "react-native"
import React, { useState } from "react"
import { useQuery } from "react-query"
import axios from "axios"

import CustomIndicator from "@/components/CustomIndicator"
import CoinItem from "@/components/CoinItem"

const Crypto = () => {
  // const [coins, setCoins] = useState([]);
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
    <View style={styles.container}>
      <StatusBar backgroundColor="#141414" />

      <View style={styles.header}>
        <View />
        <TextInput
          style={styles.searchInput}
          placeholder="Search a Coin"
          placeholderTextColor="#858585"
          onChangeText={(text) => text && setSearch(text)}
        />
      </View>

      {status !== "success" ? (
        <CustomIndicator size={150} />
      ) : (
        <FlatList
          style={styles.list}
          data={coins.filter(
            (coin) =>
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

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#141414',
    flex: 1,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    // color: '#fff',
    marginTop: 10,
  },
  list: {
    width: "90%",
  },
  searchInput: {
    // color: '#fff',
    borderBottomColor: "#4657CE",
    borderBottomWidth: 1,
    width: "40%",
    textAlign: "center",
  },
})

export default Crypto

