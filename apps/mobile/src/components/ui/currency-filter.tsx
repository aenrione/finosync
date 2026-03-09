import { View, Text, TouchableOpacity } from "react-native"
import React from "react"

const currencyConfig = {
  USD: { symbol: "$", color: "border-primary bg-primary/10 text-primary", flag: "🇺🇸" },
  EUR: { symbol: "€", color: "border-income bg-income/10 text-income", flag: "🇪🇺" },
  GBP: { symbol: "£", color: "border-investment bg-investment/10 text-investment", flag: "🇬🇧" },
  CLP: { symbol: "$", color: "border-destructive bg-destructive/10 text-destructive", flag: "🇨🇱" },
}

interface CurrencyFilterProps {
  currencies: Array<{ code: string; name?: string }>
  selectedCurrency: string
  onCurrencyChange: (currency: string) => void
}

export default function CurrencyFilter({
  currencies,
  selectedCurrency,
  onCurrencyChange,
}: CurrencyFilterProps) {
  return (
    <View className="items-start my-2">
      <View className="flex-row gap-1 mt-1">
        {currencies.map((currency) => {
          const isSelected = selectedCurrency === currency.code
          const config = currencyConfig[currency.code as keyof typeof currencyConfig]
          const selectedClasses = config
            ? `${config.color.split(" ").filter(c => c.startsWith("border-") || c.startsWith("bg-")).join(" ")}`
            : "border-primary bg-primary/10"
          return (
            <TouchableOpacity
              key={currency.code}
              className={`flex-row items-center border rounded-lg px-2 py-1 ${
                isSelected ? selectedClasses : "border-border bg-background"
              }`}
              onPress={() => onCurrencyChange(currency.code)}
            >
              <Text className="text-xs mr-1">
                {config?.flag || "💱"}
              </Text>
              <Text
                className={`text-xs font-semibold ${
                  isSelected
                    ? (config?.color.split(" ").find(c => c.startsWith("text-")) || "text-primary")
                    : "text-muted-foreground"
                }`}
              >
                {currency.code}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}