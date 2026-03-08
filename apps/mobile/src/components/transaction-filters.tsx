import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"
import React from "react"

import { useCategories } from "@/context/categories.context"
import { useAccounts } from "@/context/accounts.context"

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
  const { t } = useTranslation()
  const { categoriesData: categories } = useCategories()
  const { accountsData: accounts } = useAccounts()

  // Build dynamic filter options
  const buildFilters = () => {
    const filters: { key: string, label: string }[] = [{ key: "all", label: t("all") }]

    // Add type filters
    if (showTypeFilters) {
      filters.push({ key: "income", label: t("transaction_view.incomes") })
      filters.push({ key: "expenses", label: t("transaction_view.expenses") })
    }

    // Add category filters from actual categories
    if (showCategoryFilters && categories.length > 0) {
      const categoryFilters = categories.map(cat => ({ key: cat.name, label: cat.name }))
      filters.push(...categoryFilters)
    }

    // Add account filters
    if (showAccountFilters && accounts.length > 0) {
      const accountFilters = accounts.map(acc => ({ key: acc.account_name, label: acc.account_name }))
      filters.push(...accountFilters)
    }

    // Add custom filters
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
      return "text-green-600"
    case "expenses":
      return "text-red-500"
    case "all":
      return "text-blue-600"
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