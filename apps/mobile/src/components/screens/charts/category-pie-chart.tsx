import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native"
import { PieChart } from "react-native-chart-kit"
import React from "react"

import { useCharts } from "@/context/charts.context"
import { showAmount } from "@/utils/currency"
import Icon from "@/components/ui/icon"

const screenWidth = Dimensions.get("window").width

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  strokeWidth: 3,
  barPercentage: 0.7,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
}

const currencyConfig = {
  USD: { symbol: "$", color: "#2563EB", flag: "🇺🇸" },
  EUR: { symbol: "€", color: "#059669", flag: "🇪🇺" },
  GBP: { symbol: "£", color: "#7C3AED", flag: "🇬🇧" },
  CLP: { symbol: "$", color: "#DC2626", flag: "🇨🇱" },
}

export default function CategoryPieChart() {
  const {
    expenseData,
    incomeData,
    selectedCurrency,
    setSelectedCurrency,
    showIncome,
    setShowIncome,
  } = useCharts()

  const currentData = showIncome ? incomeData : expenseData
  const totalAmount = currentData.reduce((sum, item) => sum + item.amount, 0)
  const availableCurrencies = Object.keys(currencyConfig)

  if (currentData.length === 0) {
    return null
  }

  return (
    <View className="mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Icon name="PieChart" className="text-green-600 mr-2" size={20} />
          <Text className="text-xl font-semibold text-foreground">Categories by Currency</Text>
        </View>
        <View className="flex-row bg-muted rounded-lg p-1">
          <TouchableOpacity
            className={`px-4 py-2 rounded-md ${!showIncome ? "bg-background shadow-sm" : ""}`}
            onPress={() => setShowIncome(false)}
          >
            <Text className={`text-sm font-medium ${!showIncome ? "text-green-600" : "text-muted-foreground"}`}>
              Expenses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-md ${showIncome ? "bg-background shadow-sm" : ""}`}
            onPress={() => setShowIncome(true)}
          >
            <Text className={`text-sm font-medium ${showIncome ? "text-green-600" : "text-muted-foreground"}`}>
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row mb-4 gap-2">
        {availableCurrencies.map((currency) => (
          <TouchableOpacity
            key={currency}
            className={`flex-1 bg-background border-2 rounded-xl p-3 items-center ${
              selectedCurrency === currency ? "bg-blue-50" : "border-border"
            }`}
            style={{ borderColor: selectedCurrency === currency ? currencyConfig[currency as keyof typeof currencyConfig].color : undefined }}
            onPress={() => setSelectedCurrency(currency)}
          >
            <Text className="text-base mb-1">{currencyConfig[currency as keyof typeof currencyConfig].flag}</Text>
            <Text className={`text-xs font-semibold mb-0.5 ${
              selectedCurrency === currency ? "text-blue-600" : "text-muted-foreground"
            }`}>
              {currency}
            </Text>
            <Text className={`text-xs font-medium ${
              selectedCurrency === currency ? "text-blue-600" : "text-muted-foreground"
            }`}>
              {currencyConfig[currency as keyof typeof currencyConfig].symbol}{showAmount(totalAmount)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-background border border-border rounded-2xl items-center py-4">
        <PieChart
          data={currentData}
          width={screenWidth - 40}
          height={200}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          absolute={false}
        />
      </View>

      <View className="bg-background border border-border rounded-2xl p-4 mt-3">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-semibold text-foreground">
            {showIncome ? "Income" : "Expenses"} in {selectedCurrency}
          </Text>
          <Text className="text-lg font-bold text-blue-600">
            {currencyConfig[selectedCurrency as keyof typeof currencyConfig]?.symbol}{showAmount(totalAmount)}
          </Text>
        </View>
        <View className="space-y-3">
          {currentData.map((item, index) => (
            <View key={index} className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                <Text className="text-sm text-foreground">{item.name}</Text>
              </View>
              <Text className="text-sm font-semibold text-foreground">
                {currencyConfig[selectedCurrency as keyof typeof currencyConfig]?.symbol}{showAmount(item.amount)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
} 