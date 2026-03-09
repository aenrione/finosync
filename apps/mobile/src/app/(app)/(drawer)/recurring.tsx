import {
  View,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  SectionList,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "expo-router"

import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"
import { RecurringTransaction } from "@/types/recurring-transaction"
import { recurringTransactionService } from "@/services/recurring-transaction.service"
import { RecurringCard } from "@/components/features/recurring/recurring-card"
import { UpcomingList } from "@/components/features/recurring/upcoming-list"

type FilterType = "all" | "active" | "inactive"

const RecurringScreen = () => {
  const router = useRouter()
  const [items, setItems] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await recurringTransactionService.fetchAll()
      setItems(data)
    } catch (error) {
      console.error("Failed to fetch recurring transactions:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const data = await recurringTransactionService.fetchAll()
      setItems(data)
    } catch (error) {
      console.error("Failed to refresh:", error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  const upcoming = items
    .filter((rt) => {
      if (!rt.is_active) return false
      const dueDate = new Date(rt.next_due_date)
      const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      return dueDate <= thirtyDays
    })
    .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())

  const filteredItems = items.filter((rt) => {
    if (filter === "active") return rt.is_active
    if (filter === "inactive") return !rt.is_active
    return true
  })

  const handleItemPress = (item: RecurringTransaction) => {
    router.push(`/(app)/recurring/${item.id}`)
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="bg-card px-5 pb-4 border-b border-border">
        <View className="flex-row justify-between items-start pt-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground mb-1">Recurring</Text>
            <Text className="text-base text-muted-foreground">
              Track recurring payments & income
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-muted justify-center items-center"
            onPress={onRefresh}
          >
            <Icon name="RefreshCw" className="text-muted-foreground" size={20} />
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <View className="flex-row mt-3 gap-2">
          {(["all", "active", "inactive"] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 ${
                filter === f ? "bg-primary" : "bg-muted"
              }`}
            >
              <Text className={`text-sm font-medium capitalize ${
                filter === f ? "text-primary-foreground" : "text-muted-foreground"
              }`}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="flex-1">
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <Icon name="RefreshCw" className="text-muted-foreground mb-3" size={32} />
            <Text className="text-base text-muted-foreground">Loading...</Text>
          </View>
        ) : items.length === 0 ? (
          <View className="flex-1 justify-center items-center px-5">
            <View className="items-center max-w-xs">
              <Icon name="Repeat" className="text-muted-foreground mb-4" size={64} />
              <Text className="text-xl font-semibold text-foreground mb-2">No recurring transactions</Text>
              <Text className="text-sm text-muted-foreground text-center leading-5 mb-6">
                Track regular payments like rent, subscriptions, and salary
              </Text>
              <TouchableOpacity
                className="flex-row items-center bg-primary rounded-xl px-5 py-3"
                onPress={() => router.push("/(app)/add-recurring")}
              >
                <Icon name="Plus" className="text-primary-foreground mr-2" size={16} />
                <Text className="text-sm font-semibold text-primary-foreground">Add Recurring</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <RecurringCard item={item} onPress={() => handleItemPress(item)} />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerClassName="p-5 pb-24"
            ItemSeparatorComponent={() => <View className="h-3" />}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              upcoming.length > 0 ? (
                <View className="mb-5">
                  <Text className="text-lg font-semibold text-foreground mb-3">
                    Upcoming (30 days)
                  </Text>
                  <UpcomingList items={upcoming} onItemPress={handleItemPress} />
                  <View className="h-px bg-border my-4" />
                  <Text className="text-lg font-semibold text-foreground mb-1">All</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      <TouchableOpacity
        className="absolute bottom-8 right-5 w-14 h-14 rounded-full bg-primary justify-center items-center shadow-lg"
        onPress={() => router.push("/(app)/add-recurring")}
        activeOpacity={0.8}
      >
        <Icon name="Plus" className="text-primary-foreground" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default RecurringScreen
