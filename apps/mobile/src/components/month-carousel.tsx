import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native"
import React, { useCallback, useMemo } from "react"

import Icon from "@/components/ui/icon"

const MONTHS_BEFORE = 24
const MONTHS_AFTER = 6

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function getMonthList(): Date[] {
  const now = new Date()
  const months: Date[] = []
  for (let i = -MONTHS_BEFORE; i <= MONTHS_AFTER; i++) {
    months.push(new Date(now.getFullYear(), now.getMonth() + i, 1))
  }
  return months
}

export function formatMonthLabel(date: Date): string {
  const now = new Date()
  if (isSameMonth(date, now)) return "This month"

  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  if (isSameMonth(date, lastMonth)) return "Last month"

  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  if (isSameMonth(date, nextMonth)) return "Next month"

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, { month: "long" })
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })
}

interface MonthPickerProps {
  selectedDate: Date
  onMonthChange: (date: Date) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function MonthPicker({
  selectedDate,
  onMonthChange,
  isOpen,
  onOpenChange,
}: MonthPickerProps) {
  const months = useMemo(() => getMonthList(), [])

  const selectedIndex = useMemo(
    () => months.findIndex((m) => isSameMonth(m, selectedDate)),
    [months, selectedDate],
  )

  const handleSelect = useCallback(
    (date: Date) => {
      onMonthChange(date)
      onOpenChange(false)
    },
    [onMonthChange, onOpenChange],
  )

  const renderItem = useCallback(
    ({ item, index }: { item: Date; index: number }) => {
      const isSelected = index === selectedIndex
      const now = new Date()
      const isCurrentMonth = isSameMonth(item, now)
      const label = item.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })

      return (
        <TouchableOpacity
          onPress={() => handleSelect(item)}
          className={`px-4 py-3 flex-row items-center ${isSelected ? "bg-primary/10" : ""}`}
        >
          <Text
            className={`text-base flex-1 ${isSelected ? "text-primary font-semibold" : "text-foreground"}`}
          >
            {label}
          </Text>
          {isCurrentMonth && !isSelected && (
            <Text className="text-xs text-muted-foreground font-semibold mr-2">
              Today
            </Text>
          )}
          {isSelected && (
            <Icon name="Check" size={18} className="text-primary" />
          )}
        </TouchableOpacity>
      )
    },
    [selectedIndex, handleSelect],
  )

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={() => onOpenChange(false)}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={() => onOpenChange(false)}
        />
        <View className="bg-card rounded-t-xl max-h-96 pb-8">
          <View className="items-center py-3">
            <View className="w-10 h-1 bg-border rounded-full" />
          </View>
          <Text className="text-base font-semibold text-foreground px-4 pb-3">
            Select month
          </Text>
          <FlatList
            data={months}
            renderItem={renderItem}
            keyExtractor={(item) =>
              `${item.getFullYear()}-${item.getMonth()}`
            }
            initialScrollIndex={
              selectedIndex >= 0 ? Math.max(0, selectedIndex - 2) : undefined
            }
            getItemLayout={(_, index) => ({
              length: 48,
              offset: 48 * index,
              index,
            })}
            onScrollToIndexFailed={() => {}}
          />
        </View>
      </View>
    </Modal>
  )
}
