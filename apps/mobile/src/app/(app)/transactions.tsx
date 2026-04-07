import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated"
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { router } from "expo-router"

import TransactionFilters from "@/components/transaction-filters"
import { useTransactions } from "@/context/transactions.context"
import { filterTransactions } from "@/utils/transactionFilters"
import MonthPicker, { isSameMonth, formatMonthLabel } from "@/components/month-carousel"
import { useCategories } from "@/context/categories.context"
import TransactionList from "@/components/transaction-list"
import { useAccounts } from "@/context/accounts.context"
import ScreenHeader from "@/components/screen-header"
import { showAmount, getCurrencyMeta } from "@/utils/currency"
import { colors } from "@/lib/colors"
import { useStore } from "@/utils/store"
import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"

export default function TransactionsScreen() {
  const {
    transactionsData: transactions,
    loading,
    hasMore,
    loadMore,
    refreshData,
  } = useTransactions()
  const { categoriesData: categories } = useCategories()
  const { accountsData: accounts } = useAccounts()
  const baseCurrency = useStore((s) => s.baseCurrency)
  const sym = getCurrencyMeta(baseCurrency).symbol

  const [selectedFilter, setSelectedFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(() => new Date())
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)

  const isCurrentMonth = isSameMonth(selectedMonth, new Date())

  const onRefresh = useCallback(async () => {
    await refreshData()
  }, [refreshData])

  const goToToday = useCallback(() => {
    setSelectedMonth(new Date())
  }, [])

  // Swipe toast feedback
  const toastOpacity = useSharedValue(0)
  const [toastLabel, setToastLabel] = useState("")
  const [toastDirection, setToastDirection] = useState<"left" | "right">("left")
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const toastAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }))

  const showSwipeToast = useCallback(
    (direction: 1 | -1) => {
      setSelectedMonth((prev) => {
        const next = new Date(prev.getFullYear(), prev.getMonth() + direction, 1)
        setToastLabel(formatMonthLabel(next))
        return next
      })
      setToastDirection(direction === 1 ? "left" : "right")

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastOpacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 300 }),
      )
    },
    [toastOpacity],
  )

  const swipeLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(showSwipeToast)(1)
    })

  const swipeRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(showSwipeToast)(-1)
    })

  const swipeGesture = Gesture.Race(swipeLeft, swipeRight)

  // Filter by selected month
  const monthTransactions = useMemo(
    () =>
      transactions.filter((tx) => {
        const dateStr = tx.transaction_date || tx.post_date
        if (!dateStr) return false
        return isSameMonth(new Date(dateStr), selectedMonth)
      }),
    [transactions, selectedMonth],
  )

  // Filter by type / category / account
  const filteredTransactions = filterTransactions(
    monthTransactions,
    selectedFilter,
    categories,
    accounts,
  )

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()

  const visibleTransactions = filteredTransactions.filter((tx) => {
    if (!normalizedSearchTerm) return true
    return [
      tx.description,
      tx.comment,
      tx.category?.name,
      tx.account_name,
      tx.holder_name,
      tx.holder_institution,
    ].some((v) => v?.toLowerCase().includes(normalizedSearchTerm))
  })

  // Stats for the whole month (regardless of filter)
  const incomeTotal = monthTransactions
    .filter((tx) => tx.transaction_type === "credit" || tx.amount > 0)
    .reduce((s, t) => s + t.amount, 0)
  const expenseTotal = monthTransactions
    .filter((tx) => tx.transaction_type === "debit" || tx.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)

  const isEmpty = visibleTransactions.length === 0

  // Build a single context line based on filter
  const contextLine = useMemo(() => {
    const filter = selectedFilter.toLowerCase()
    const count = visibleTransactions.length

    if (isEmpty) return null

    if (filter === "all") {
      const moved = incomeTotal + expenseTotal
      return `${count} transactions · ${sym} ${showAmount(moved)} moved`
    }
    if (filter === "income") {
      return `${count} transactions · ${sym} ${showAmount(incomeTotal)} received`
    }
    if (filter === "expenses") {
      return `${count} transactions · ${sym} ${showAmount(expenseTotal)} spent`
    }

    // Category or account
    const total = visibleTransactions.reduce(
      (s, t) => s + Math.abs(t.amount),
      0,
    )
    return `${count} transaction${count !== 1 ? "s" : ""} · ${sym} ${showAmount(total)}`
  }, [
    selectedFilter,
    visibleTransactions,
    incomeTotal,
    expenseTotal,
    isEmpty,
    sym,
  ])

  // Secondary chips — only shown when there are transactions
  const chips = useMemo(() => {
    if (isEmpty) return []

    const filter = selectedFilter.toLowerCase()
    const net = incomeTotal - expenseTotal

    if (filter === "all") {
      return [
        `Net ${net >= 0 ? "+" : ""}${sym} ${showAmount(net)}`,
      ]
    }
    if (filter === "expenses") {
      const catCounts: Record<string, number> = {}
      for (const tx of visibleTransactions) {
        const cat = tx.category?.name || "Other"
        catCounts[cat] = (catCounts[cat] || 0) + Math.abs(tx.amount)
      }
      const top = Object.entries(catCounts).sort(([, a], [, b]) => b - a)[0]
      return top ? [`Top: ${top[0]}`] : []
    }
    if (filter === "income") {
      const largest = visibleTransactions.reduce(
        (max, tx) => (tx.amount > (max?.amount ?? 0) ? tx : max),
        visibleTransactions[0] as (typeof visibleTransactions)[0] | undefined,
      )
      return largest?.description ? [`Largest: ${largest.description}`] : []
    }

    // Category — show % of spending
    const isCategory = categories.some((c) => c.name === selectedFilter)
    if (isCategory && expenseTotal > 0) {
      const catTotal = visibleTransactions.reduce(
        (s, t) => s + Math.abs(t.amount),
        0,
      )
      const pct = Math.round((catTotal / expenseTotal) * 100)
      return [`${pct}% of spending`]
    }

    return []
  }, [
    selectedFilter,
    visibleTransactions,
    incomeTotal,
    expenseTotal,
    isEmpty,
    categories,
    sym,
  ])

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        variant="drawer"
        title="Transactions"
        rightActions={[
          {
            icon: "CalendarDays",
            onPress: () => setMonthPickerOpen(true),
          },
          {
            icon: "Plus",
            onPress: () => router.push("/(app)/add-transaction"),
          },
        ]}
      />

      {/* Month picker modal */}
      <MonthPicker
        selectedDate={selectedMonth}
        onMonthChange={setSelectedMonth}
        isOpen={monthPickerOpen}
        onOpenChange={setMonthPickerOpen}
      />

      {/* Layer 1: Search */}
      <View className="px-5 pt-3">
        <View className="flex-row items-center bg-card rounded-2xl px-4 h-12 border border-border">
          <Icon name="Search" className="text-muted-foreground mr-3" size={18} />
          <TextInput
            className="flex-1 text-foreground text-base"
            placeholder="Search transactions..."
            placeholderTextColor={colors.mutedForeground}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")}>
              <Icon name="X" className="text-muted-foreground" size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Layer 2: Filter pills */}
      <View className="px-5 pt-3">
        <TransactionFilters
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          showTypeFilters={true}
          showCategoryFilters={true}
          showAccountFilters={true}
        />
      </View>

      {/* Layer 3: Context — month label + summary line */}
      <View className="px-5 pb-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            {Platform.OS === "web" && (
              <TouchableOpacity
                onPress={() => showSwipeToast(-1)}
                className="mr-2 p-1 rounded-full bg-muted"
              >
                <Icon name="ChevronLeft" size={16} className="text-foreground" />
              </TouchableOpacity>
            )}
            <Text className="text-sm font-extrabold text-foreground">
              {formatMonthLabel(selectedMonth)}
            </Text>
            {Platform.OS === "web" && (
              <TouchableOpacity
                onPress={() => showSwipeToast(1)}
                className="ml-2 p-1 rounded-full bg-muted"
              >
                <Icon name="ChevronRight" size={16} className="text-foreground" />
              </TouchableOpacity>
            )}
            {!isCurrentMonth && (
              <TouchableOpacity
                onPress={goToToday}
                className="ml-2 bg-primary/10 rounded-full px-2.5 py-0.5"
              >
                <Text className="text-xs font-bold text-primary">Today</Text>
              </TouchableOpacity>
            )}
          </View>
          {chips.length > 0 && (
            <View className="flex-row gap-2">
              {chips.map((chip) => (
                <View
                  key={chip}
                  className="bg-muted rounded-full px-2.5 py-1 border border-border"
                >
                  <Text className="text-xs font-bold text-muted-foreground">
                    {chip}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {contextLine && (
          <Text className="text-sm text-muted-foreground mt-1">
            {contextLine}
          </Text>
        )}
      </View>

      {/* Content — swipe left/right to change month */}
      <GestureDetector gesture={swipeGesture}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        >
          <View className="px-5 pb-4">
            <TransactionList
              transactions={visibleTransactions}
              loading={loading}
              hasMore={hasMore}
              loadMore={loadMore}
              refreshData={refreshData}
              showLoadMore={true}
              groupByDate={false}
              emptyMessage={
                normalizedSearchTerm
                  ? "No transactions match your search"
                  : "Try another month or add a transaction"
              }
            />
          </View>
        </ScrollView>
      </GestureDetector>

      {/* Swipe month toast */}
      <Animated.View
        pointerEvents="none"
        style={toastAnimatedStyle}
        className="absolute self-center bottom-24 bg-foreground/80 rounded-full px-5 py-2.5 flex-row items-center"
      >
        {toastDirection === "right" && (
          <Icon name="ChevronLeft" size={16} className="text-background mr-1.5" />
        )}
        <Text className="text-background text-sm font-bold">{toastLabel}</Text>
        {toastDirection === "left" && (
          <Icon name="ChevronRight" size={16} className="text-background ml-1.5" />
        )}
      </Animated.View>
    </SafeAreaView>
  )
}
