import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
} from "react-native"
import React, { useState } from "react"

import { useCategories } from "@/context/categories.context"
import { useAccounts } from "@/context/accounts.context"
import Icon from "@/components/ui/icon"

import { useTranslation } from "./_texts/TransactionFilters.text"

interface TransactionFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  showTypeFilters?: boolean;
  showCategoryFilters?: boolean;
  showAccountFilters?: boolean;
}

export default function TransactionFilters({
  selectedFilter,
  onFilterChange,
  showTypeFilters = true,
  showCategoryFilters = true,
  showAccountFilters = false,
}: TransactionFiltersProps) {
  const text = useTranslation()
  const { categoriesData: categories } = useCategories()
  const { accountsData: accounts } = useAccounts()

  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const [accountSheetOpen, setAccountSheetOpen] = useState(false)

  // Determine if the current filter is a category or account
  const selectedCategory = categories.find(
    (cat) => cat.name === selectedFilter,
  )
  const selectedAccount = accounts.find(
    (acc) => acc.account_name === selectedFilter,
  )

  const quickFilters: { key: string; label: string }[] = [
    { key: "all", label: text.all },
  ]

  if (showTypeFilters) {
    quickFilters.push({ key: "income", label: text.incomes })
    quickFilters.push({ key: "expenses", label: text.expenses })
  }

  const handleCategorySelect = (categoryName: string) => {
    onFilterChange(categoryName)
    setCategorySheetOpen(false)
  }

  const handleAccountSelect = (accountName: string) => {
    onFilterChange(accountName)
    setAccountSheetOpen(false)
  }

  const clearCategoryFilter = () => {
    onFilterChange("all")
  }

  const clearAccountFilter = () => {
    onFilterChange("all")
  }

  return (
    <View className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {/* Quick type filters */}
        {quickFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            className={`flex-row items-center rounded-full px-4 py-2 mr-3 ${
              selectedFilter === filter.key ? "bg-primary" : "bg-muted"
            }`}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text
              className={`text-sm font-medium ${
                selectedFilter === filter.key
                  ? "text-white"
                  : "text-muted-foreground"
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Category picker chip */}
        {showCategoryFilters && categories.length > 0 && (
          <TouchableOpacity
            className={`flex-row items-center rounded-full px-4 py-2 mr-3 ${
              selectedCategory ? "bg-primary" : "bg-muted"
            }`}
            onPress={() => setCategorySheetOpen(true)}
          >
            <Icon
              name="Tag"
              size={14}
              className={`mr-1.5 ${selectedCategory ? "text-white" : "text-muted-foreground"}`}
            />
            <Text
              className={`text-sm font-medium ${
                selectedCategory ? "text-white" : "text-muted-foreground"
              }`}
            >
              {selectedCategory ? selectedCategory.name : text.category}
            </Text>
            {selectedCategory ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  clearCategoryFilter()
                }}
                hitSlop={8}
                className="ml-1.5"
              >
                <Icon name="X" size={14} className="text-white" />
              </TouchableOpacity>
            ) : (
              <Icon
                name="ChevronDown"
                size={14}
                className="text-muted-foreground ml-1"
              />
            )}
          </TouchableOpacity>
        )}

        {/* Account picker chip */}
        {showAccountFilters && accounts.length > 0 && (
          <TouchableOpacity
            className={`flex-row items-center rounded-full px-4 py-2 mr-3 ${
              selectedAccount ? "bg-primary" : "bg-muted"
            }`}
            onPress={() => setAccountSheetOpen(true)}
          >
            <Icon
              name="Wallet"
              size={14}
              className={`mr-1.5 ${selectedAccount ? "text-white" : "text-muted-foreground"}`}
            />
            <Text
              className={`text-sm font-medium ${
                selectedAccount ? "text-white" : "text-muted-foreground"
              }`}
            >
              {selectedAccount
                ? selectedAccount.account_name
                : text.account}
            </Text>
            {selectedAccount ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  clearAccountFilter()
                }}
                hitSlop={8}
                className="ml-1.5"
              >
                <Icon name="X" size={14} className="text-white" />
              </TouchableOpacity>
            ) : (
              <Icon
                name="ChevronDown"
                size={14}
                className="text-muted-foreground ml-1"
              />
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Category bottom sheet */}
      <Modal
        visible={categorySheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCategorySheetOpen(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0 bg-black/50"
            onPress={() => setCategorySheetOpen(false)}
          />
          <View className="bg-card rounded-t-xl max-h-96 pb-8">
            <View className="items-center py-3">
              <View className="w-10 h-1 bg-border rounded-full" />
            </View>
            <Text className="text-base font-semibold text-foreground px-4 pb-3">
              {text.selectCategory}
            </Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = selectedFilter === item.name
                return (
                  <Pressable
                    onPress={() => handleCategorySelect(item.name)}
                    className={`px-4 py-3 flex-row items-center ${
                      isSelected ? "bg-primary/10" : ""
                    }`}
                  >
                    <Icon
                      name={item.icon || "Folder"}
                      size={18}
                      className={
                        isSelected ? "text-primary mr-3" : "text-muted-foreground mr-3"
                      }
                    />
                    <Text
                      className={`text-base flex-1 ${
                        isSelected
                          ? "text-primary font-semibold"
                          : "text-foreground"
                      }`}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Icon name="Check" size={18} className="text-primary" />
                    )}
                  </Pressable>
                )
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Account bottom sheet */}
      <Modal
        visible={accountSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAccountSheetOpen(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0 bg-black/50"
            onPress={() => setAccountSheetOpen(false)}
          />
          <View className="bg-card rounded-t-xl max-h-96 pb-8">
            <View className="items-center py-3">
              <View className="w-10 h-1 bg-border rounded-full" />
            </View>
            <Text className="text-base font-semibold text-foreground px-4 pb-3">
              {text.selectAccount}
            </Text>
            <FlatList
              data={accounts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = selectedFilter === item.account_name
                return (
                  <Pressable
                    onPress={() => handleAccountSelect(item.account_name)}
                    className={`px-4 py-3 flex-row items-center ${
                      isSelected ? "bg-primary/10" : ""
                    }`}
                  >
                    <Icon
                      name="Wallet"
                      size={18}
                      className={
                        isSelected ? "text-primary mr-3" : "text-muted-foreground mr-3"
                      }
                    />
                    <Text
                      className={`text-base flex-1 ${
                        isSelected
                          ? "text-primary font-semibold"
                          : "text-foreground"
                      }`}
                    >
                      {item.account_name}
                    </Text>
                    {isSelected && (
                      <Icon name="Check" size={18} className="text-primary" />
                    )}
                  </Pressable>
                )
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}
