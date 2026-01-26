import { View, Text, StyleSheet, Image } from "react-native"
import React from "react"

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  // maximumFractionDigits: 1, // (causes 2500.99 to be printed as $2,501)
})

const CoinItem = ({ coin }) => (
  <View style={styles.containerItem}>
    <View style={styles.coinName}>
      <Image source={{ uri: coin.image }} style={styles.image} />
      <View style={styles.containerNames}>
        <Text style={styles.text}>{coin.name}</Text>
        <Text style={styles.textSymbol}>{coin.symbol}</Text>
      </View>
    </View>
    <View>
      <Text style={styles.textPrice}>{formatter.format(coin.current_price)}</Text>
      <Text
        style={[
          styles.pricePercentage,
          coin.price_change_percentage_24h > 0 ? styles.priceUp : styles.priceDown,
        ]}
      >
        {coin.price_change_percentage_24h.toFixed(2)}%
      </Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  containerItem: {
    backgroundColor: "white",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  containerNames: {
    marginLeft: 10,
  },
  coinName: {
    flexDirection: "row",
  },
  text: {
    color: "#333",
  },
  textPrice: {
    color: "#333",
    fontWeight: "bold",
  },
  pricePercentage: {
    textAlign: "right",
  },
  priceUp: {
    color: "#00B589",
  },
  priceDown: {
    color: "#fc4422",
  },
  image: {
    width: 30,
    height: 30,
  },
  textSymbol: {
    color: "#434343",
    textTransform: "uppercase",
  },
})

export default CoinItem
