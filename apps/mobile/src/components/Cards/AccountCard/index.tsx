import { useTranslation } from "react-i18next"
import { View } from "react-native"
import React from "react"

import { formatCurrency } from "@/utils/currency"
import { Text } from "@/components/theme/Themed" // Your themed Text with tailwind support
import Icon from "@/components/ui/icon"
import { IconName } from "@/types/icon"

type Account = {
  name: string
  holder_name?: string
  icon: IconName
  subtype: string // e.g., "checking", "savings"
  amount: number // The balance amount
  code: string // Currency code, e.g., "USD", "EUR"
}

const AccountCard = ({ account }: {account: Account}) => {
  const { t } = useTranslation()

  return (
    <View className="mt-2.5 ml-5 flex-row items-center bg-black">
      {/* Icon */}
      <View className="w-10 h-10 rounded-full bg-light_black flex items-center justify-center">
        <Icon name={account.icon} />
      </View>

      {/* Details */}
      <View className="flex-1 mx-2.5 justify-between">
        <Text className="text-base font-semibold text-white">{account.name}</Text>

        {account.holder_name && (
          <Text className="text-xs font-normal text-primary-light">{account.holder_name}</Text>
        )}

        <Text className="text-xs font-normal text-gray-dark">{t(`account_view.types.${account.subtype}`)}</Text>
      </View>

      {/* Amount */}
      <Text
        className={`text-lg font-semibold ${
          account.amount >= 0 ? "text-success" : "text-alert"
        }`}
      >
        {account.amount >= 0 ? "+" : "-"}
        {formatCurrency(account.amount, account.code)}
      </Text>
    </View>
  )
}

export default AccountCard

