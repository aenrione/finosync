import { getAccounts, deleteAccount } from "src/dbHelpers/accountHelper"
import BlockHeader from "src/components/Headers/BlockHeader"
import SwipeableFlatList from "react-native-swipeable-list"
import AccountCard from "src/components/Cards/AccountCard"
import { useIsFocused } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import QuickActions from "src/utils/quickActions"
import {
  StyleSheet,
} from "react-native"

import { Text, View } from "@/components/theme/Themed"
// import routes from "src/config/routes"

const List = ({ navigation }) => {
  const focused = useIsFocused()

  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    getAccounts(setAccounts)
  }, [focused])

  // Delete Item
  const __delete = (id) => {
    deleteAccount(id)
    getAccounts(setAccounts)
  }

  // Update Item
  const __update = (item) => {
    // navigation.navigate(routes.AddTransaction.name, { item: item })
  }

  return (
    <SwipeableFlatList
      data={accounts.slice(0, 3)}
      maxSwipeDistance={140}
      shouldBounceOnMount={true}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, index) => index.toString()}
      renderQuickActions={({ index, item }) => QuickActions(item, __update, __delete)}
      ListHeaderComponent={() => (
        <View>
          <View style={{ paddingLeft: 20 }}>
            <BlockHeader
              title='Accounts'
              onPress={() => navigation.navigate()} />
          </View>
        </View>
      )}
      ListEmptyComponent={() => (
        <View className="p-5">
          <Text 
            className="text-white text-center text-lg">You don't have any accounts !</Text>
        </View>
      )}
      renderItem={({ item, index }) => <AccountCard key={index} account={item} />}
    />
  )
}

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 20
  },
})

export default List


