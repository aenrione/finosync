import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useCallback, useEffect, useState } from "react"
import {
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native"

import { SafeAreaView } from "react-native-safe-area-context"
import ScreenHeader from "@/components/screen-header"
import { Button, ButtonText } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"
import { RecurringTransaction } from "@/types/recurring-transaction"
import { recurringTransactionService } from "@/services/recurring-transaction.service"
import { FrequencyBadge } from "@/components/features/recurring/frequency-badge"
import { useStore } from "@/utils/store"

const RecurringDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const setCurrentRecurring = useStore((state) => state.setCurrentRecurringTransaction)

  const [item, setItem] = useState<RecurringTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true)
      const data = await recurringTransactionService.fetch(Number(id))
      setItem(data)
    } catch (error) {
      console.error("Failed to fetch recurring transaction:", error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchDetail()
    setRefreshing(false)
  }, [fetchDetail])

  const handleEdit = () => {
    if (item) {
      setCurrentRecurring(item)
      router.push("/(app)/add-recurring")
    }
  }

  const handleDelete = () => {
    Alert.alert("Delete", `Delete "${item?.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await recurringTransactionService.delete(Number(id))
            router.back()
          } catch (error) {
            console.error("Failed to delete:", error)
            Alert.alert("Error", "Failed to delete")
          }
        },
      },
    ])
  }

  const handleToggleActive = async () => {
    if (!item) return
    try {
      await recurringTransactionService.update(item.id, { is_active: !item.is_active })
      await fetchDetail()
    } catch (error) {
      console.error("Failed to toggle active:", error)
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Recurring" variant="back" />
        <View className="flex-1 justify-center items-center">
          <Icon name="RefreshCw" className="text-muted-foreground" size={32} />
        </View>
      </SafeAreaView>
    )
  }

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Recurring" variant="back" />
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted-foreground">Not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  const isExpense = item.transaction_type === "expense"

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title={item.name} variant="back" />

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Info Card */}
        <View className="mx-5 mt-4 rounded-xl bg-card p-5 border border-border">
          <View className="items-center mb-4">
            <View className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${
              isExpense ? "bg-red-100" : "bg-green-100"
            }`}>
              <Icon
                name={isExpense ? "ArrowDownLeft" : "ArrowUpRight"}
                size={32}
                className={isExpense ? "text-red-600" : "text-green-600"}
              />
            </View>
            <Text className={`text-2xl font-bold ${isExpense ? "text-red-600" : "text-green-600"}`}>
              {item.formatted_amount || `$${item.amount.toLocaleString()}`}
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">{item.currency}</Text>
          </View>

          <View className="flex-row justify-center items-center gap-2 mb-4">
            <FrequencyBadge frequency={item.frequency} />
            {item.auto_create && (
              <View className="rounded-full bg-primary/10 px-2.5 py-0.5">
                <Text className="text-xs font-medium text-primary">Auto-create</Text>
              </View>
            )}
            <View className={`rounded-full px-2.5 py-0.5 ${item.is_active ? "bg-green-100" : "bg-muted"}`}>
              <Text className={`text-xs font-medium ${item.is_active ? "text-green-700" : "text-muted-foreground"}`}>
                {item.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View className="gap-3">
            <DetailRow label="Next Due" value={new Date(item.next_due_date).toLocaleDateString()} />
            <DetailRow label="Start Date" value={new Date(item.start_date).toLocaleDateString()} />
            {item.end_date && (
              <DetailRow label="End Date" value={new Date(item.end_date).toLocaleDateString()} />
            )}
            {item.category && <DetailRow label="Category" value={item.category.name} />}
            {item.account_name && <DetailRow label="Account" value={item.account_name} />}
            {item.notes && <DetailRow label="Notes" value={item.notes} />}
            {item.linked_transaction_count !== undefined && (
              <DetailRow label="Linked Transactions" value={item.linked_transaction_count.toString()} />
            )}
          </View>
        </View>

        {/* Actions */}
        <View className="mx-5 mt-4 gap-3 mb-8">
          <Button onPress={handleEdit}>
            <Icon name="Pencil" size={16} className="text-primary-foreground mr-2" />
            <ButtonText>Edit</ButtonText>
          </Button>
          <Button variant="outline" onPress={handleToggleActive}>
            <Icon
              name={item.is_active ? "Pause" : "Play"}
              size={16}
              className="text-foreground mr-2"
            />
            <ButtonText variant="outline">
              {item.is_active ? "Deactivate" : "Activate"}
            </ButtonText>
          </Button>
          <Button variant="destructive" onPress={handleDelete}>
            <Icon name="Trash2" size={16} className="text-destructive-foreground mr-2" />
            <ButtonText variant="destructive">Delete</ButtonText>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-medium text-foreground">{value}</Text>
    </View>
  )
}

export default RecurringDetail
