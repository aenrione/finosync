import {
  StyleSheet, View, ScrollView, Dimensions,
} from "react-native"
import React, { useState, useRef } from "react"

import { Colors } from "@/styles"

const Carousel = (props) => {
  const data = props.data || []
  const offset = 2 * (props.offset || 0)
  const renderCard = props.renderCard || defaultCard
  const style = props.style || []

  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const CARD_WIDTH = Dimensions.get("window").width - offset // width of each card in the carousel
  const scrollViewRef = useRef()

  const onScroll = (event) => {
    const xOffset = event.nativeEvent.contentOffset.x
    const activeIndex = Math.round(xOffset / CARD_WIDTH) // Determining active card index based on scroll position and card width
    setActiveCardIndex(activeIndex)
  }

  const defaultCard = ({ index }) => <View key={index} />

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        rf={scrollViewRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {data.map((item, index) => renderCard(item, index))}
      </ScrollView>

      {data.length > 1 && (
        <View style={styles.dotIndicator}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: activeCardIndex === index ? Colors.WHITE : Colors.GRAY_LIGHT }
              ]}
            />
          ))}
        </View>)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: Colors.GRAY_DARKER,
    overflow: "hidden",
  },
  currencyCode: {
    color: Colors.WHITE,
    marginTop: 10,
  },
  cardContent: {
    flexDirection: "row",
    flex: 1, // Take the full width
    justifyContent: "center",
  },
  dotIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end", // Move dots to the bottom
    paddingBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  barContainer: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: Colors.WHITE,
  },
  blockContainer: {
    padding: 10,
    paddingHorizontal: 20,
  },
  itemContainer: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center", // Move dots to the bottom
    paddingBottom: 3,
  },
})

export default Carousel


