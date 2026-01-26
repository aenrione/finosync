import {
  View,
  Text,
} from "react-native"
import React from "react"

import { formatCurrency, curStyle } from "@/utils/currency"
import { Transaction } from "@/types/transaction"
import Icon from "@/components/ui/icon"
import { IconName } from "@/types/icon"

type TransactionCardProps = {
  transaction: Transaction
}

const TransactionCard = (props: TransactionCardProps) => {
  const transaction = props.transaction

  const getIcon = (): IconName => {
    if (transaction.icon) return transaction.icon
    else return "FileQuestion"
  }

  return (
    <View className="mt-2.5 ml-5 flex-row items-center bg-background rounded-lg p-2">
      {/* Icon */}
      <View className="w-10 h-10 rounded-full bg-light_black flex items-center justify-center">
        <Icon name={getIcon()} />
      </View>

      {/* Details */}
      <View className="flex-1 mx-2.5 justify-between">
        {
          transaction.description &&
          <Text className="text-base font-semibold">{transaction.description}</Text>
        }
        {
          transaction.category && (
            <Text className="text-xs font-normal text-gray-dark">{transaction.category.name}</Text>
          )
        }
        <Text className="text-xs font-normal">{transaction.account_name}</Text>
        <Text className="text-xs font-normal">{new Date(transaction.transaction_date).toLocaleString()}</Text>
      </View>

      {/* Amount */}
      <Text
        style={curStyle(transaction.amount)}
        className="text-lg font-semibold"
      >
        {formatCurrency(transaction.amount, transaction.currency)}
      </Text>
    </View>
  )
}
export default TransactionCard

