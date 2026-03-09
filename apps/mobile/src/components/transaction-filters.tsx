import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import React from "react"

import { useCategories } from "@/context/categories.context"
import { useAccounts } from "@/context/accounts.context"

import { useTranslation } from "./_texts/TransactionFilters.text"

interface TransactionFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  showTypeFilters?: boolean;
  showCategoryFilters?: boolean;
  showAccountFilters?: boolean;
  customFilters?: string[];
}

export default function TransactionFilters({
  selectedFilter,
  onFilterChange,
  showTypeFilters = true,
  showCategoryFilters = true,
  showAccountFilters = false,
  customFilters = []
}: TransactionFiltersProps) {
  const text = useTranslation()
  const { categoriesData: categories } = useCategories()
  const { accountsData: accounts } = useAccounts()

  const buildFilters = () => {
    const filters: { key: string, label: string }[] = [{ key: "all", label: text.all }]

    if (showTypeFilters) {
      filters.push({ key: "income", label: text.incomes })
      filters.push({ key: "expenses", label: text.expenses })
    }

    if (showCategoryFilters && categories.length > 0) {
      const categoryFilters = categories.map(cat => ({ key: cat.name, label: cat.name }))
      filters.push(...categoryFilters)
    }

    if (showAccountFilters && accounts.length > 0) {
      const accountFilters = accounts.map(acc => ({ key: acc.account_name, label: acc.account_name }))
      filters.push(...accountFilters)
    }

    if (customFilters.length > 0) {
      const custom = customFilters.map(filter => ({ key: filter, label: filter }))
      filters.push(...custom)
    }

    return filters
  }

  const filters = buildFilters()

  const getFilterIcon = (filterKey: string) => {
    switch (filterKey) {
    case "income":
      return "TrendingUp"
    case "expenses":
      return "TrendingDown"
    case "all":
      return "List"
    default:
      return "Tag"
    }
  }

  const getFilterColor = (filterKey: string) => {
    switch (filterKey) {
    case "income":
      return "text-income"
    case "expenses":
      return "text-expense"
    case "all":
      return "text-primary"
    default:
      return "text-muted-foreground"
    }
  }

  return (
    <View className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            className={`flex-row items-center rounded-full px-4 py-2 mr-3 ${
              selectedFilter === filter.key ? "bg-primary" : "bg-muted"
            }`}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text className={`text-sm font-medium ${
              selectedFilter === filter.key ? "text-white" : "text-muted-foreground"
            }`}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}
