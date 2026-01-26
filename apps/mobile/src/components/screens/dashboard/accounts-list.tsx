import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import React, { useState } from "react"
import { router } from "expo-router"

import { useAccounts } from "@/context/accounts.context"
import { showAmount } from "@/utils/currency"
import { Account } from "@/types/account"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"


export default function AccountsList({ accounts }: { accounts: Account[] }) {
  if (!accounts || accounts.length === 0) {
    return null
  }
  const isVisible = useStore((state) => state.isVisible)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { refreshData, deleteAccount } = useAccounts()
  
  const handleLongPress = (account: Account) => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete ${account.account_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => handleDelete(account.id.toString())
        }
      ]
    )
  }
  
  const handleDelete = async (accountId: string) => {
    try {
      setDeletingId(accountId)
      setIsDeleting(true)
      await deleteAccount(accountId)
      await refreshData()
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to delete account. Please try again."
      )
    } finally {
      setDeletingId(null)
      setIsDeleting(false)
    }
  }


  return (
    <View className="px-5 mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-foreground">Accounts</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {accounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            onPress={() => router.push(`/(app)/account/${account.id}`)}
            onLongPress={() => handleLongPress(account)}
            delayLongPress={500}
            className={`bg-background border border-border rounded-2xl p-4 mr-4 min-w-[200px] shadow-sm ${deletingId === account.id ? "opacity-50" : ""}`}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary/10 justify-center items-center mr-3">
                  <Icon name="CreditCard" className="text-primary" size={20} />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-foreground">
                    {account.account_name.slice(0, 25)}
                  </Text>
                  <Text className="text-xs text-muted-foreground">{account.account_type}</Text>
                </View>
              </View>
              <Icon name="ChevronRight" className="text-muted-foreground" size={16} />
            </View>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-muted-foreground mb-1">Balance</Text>
                <Text className="text-lg font-bold text-foreground">{
                  showAmount(account.balance, isVisible) 
                }</Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-muted-foreground mb-1">Change</Text>
                <Text className="text-xs text-green-600 font-medium">
                  {account.change_pct !== undefined ? `+${account.change_pct}% this month` : "--"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
} 