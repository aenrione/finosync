import { View, Pressable, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Check } from "lucide-react-native"

import { CurrenciesSelect } from "@/components/search-selects/currencies"
import { Button, ButtonText } from "@/components/ui/button"
import { useTranslation } from "@/locale/onboarding/currency.text"
import { useStore } from "@/utils/store"
import { Text } from "@/components/ui/text"
import { colors } from "@/lib/colors"

const QUICK_PICKS = [
  { code: "CLP", label: "CLP", name: "Chilean Peso" },
  { code: "USD", label: "USD", name: "US Dollar" },
  { code: "EUR", label: "EUR", name: "Euro" },
]

export default function CurrencyScreen() {
  const router = useRouter()
  const t = useTranslation()
  const { setOnboardingCurrency, setBaseCurrency, onboardingData } = useStore()
  const [selected, setSelected] = useState<string | null>(onboardingData.preferredCurrency)

  const handleSelect = (code: string) => {
    setSelected(code)
    setOnboardingCurrency(code)
    setBaseCurrency(code)
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-2xl font-bold text-foreground mb-2">{t.title}</Text>
      <Text className="text-sm text-muted-foreground mb-6">{t.subtitle}</Text>

      {/* Quick picks */}
      <View className="flex-row gap-3 mb-6">
        {QUICK_PICKS.map((currency) => {
          const isSelected = selected === currency.code
          return (
            <Pressable
              key={currency.code}
              onPress={() => handleSelect(currency.code)}
              className={`flex-1 items-center justify-center rounded-xl border-2 py-4 ${
                isSelected ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}
            >
              {isSelected ? (
                <View className="absolute top-2 right-2">
                  <Check size={16} color={colors.primary} />
                </View>
              ) : null}
              <Text className={`text-lg font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                {currency.label}
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">{currency.name}</Text>
            </Pressable>
          )
        })}
      </View>

      {/* More currencies */}
      <Text className="text-sm font-medium text-muted-foreground mb-2">{t.moreCurrencies}</Text>
      <CurrenciesSelect
        value={selected}
        onChange={(curr: { code: string; name: string; symbol: string }) => handleSelect(curr.code)}
        label=""
      />

      <View className="flex-1" />

      {/* CTA */}
      <Button
        size="lg"
        disabled={!selected}
        onPress={() => router.push("/(app)/(onboarding)/goals")}
        className="w-full mt-6"
      >
        <ButtonText size="lg">{t.cta}</ButtonText>
      </Button>
    </ScrollView>
  )
}
