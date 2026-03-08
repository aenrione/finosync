import { View, Text, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"
import { useRouter } from "expo-router"
import React from "react"

import { Account } from "@/types/account"
import Icon from "@/components/ui/icon"

type QuickAction = {
  id: string
  title: string
  icon: string
  color: string
  bgColor: string
  route: string
}

const quickActions: QuickAction[] = [
  {
    id: "add-account",
    title: "Add Account",
    icon: "Plus",
    color: "text-primary",
    bgColor: "bg-primary/10",
    route: "/add-account"
  },
  {
    id: "add-transaction",
    title: "Add Transaction",
    icon: "Plus",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    route: "/add-transaction"
  }
]

export default function QuickActions({ accounts }: { accounts: Account[] }) {
  const { t } = useTranslation()
  const router = useRouter()
  const hasLocalAccounts = Array.isArray(accounts) && accounts.some(account => account.account_type === "local")

  const handleAction = (action: QuickAction, disabled: boolean) => {
    if (!disabled && action.route) {
      router.push(action.route as any)
    }
  }

  return (
    <View className="px-5 mt-6">
      <View className="flex-row justify-between">
        {quickActions.map((action) => {
          const isDisabled = action.id === "add-transaction" && !hasLocalAccounts
          return (
            <TouchableOpacity
              key={action.id}
              className={`items-center flex-1 ${isDisabled ? "opacity-50" : ""}`}
              onPress={() => handleAction(action, isDisabled)}
              disabled={isDisabled}
              activeOpacity={isDisabled ? 1 : 0.7}
            >
              <View className={`w-14 h-14 rounded-full justify-center items-center mb-2 ${action.bgColor}`}>
                <Icon name={action.icon as any} size={24} className={action.color} />
              </View>
              <Text className="text-xs font-semibold text-muted-foreground text-center">
                {action.title}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}