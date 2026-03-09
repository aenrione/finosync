import { View, KeyboardAvoidingView, Platform } from "react-native"
import { useRouter } from "expo-router"
import { useState } from "react"
import { DollarSign } from "lucide-react-native"

import { Button, ButtonText } from "@/components/ui/button"
import { useTranslation } from "@/locale/onboarding/income.text"
import { MoneyInput } from "@/components/ui/money-input"
import { useStore } from "@/utils/store"
import { Text } from "@/components/ui/text"

export default function IncomeScreen() {
  const router = useRouter()
  const t = useTranslation()
  const { setOnboardingIncome, onboardingData } = useStore()
  const currency = onboardingData.preferredCurrency || "USD"
  const [value, setValue] = useState(
    onboardingData.monthlyIncome ? String(onboardingData.monthlyIncome) : ""
  )

  const handleChange = (raw: string) => {
    setValue(raw)
    const num = parseFloat(raw)
    setOnboardingIncome(isNaN(num) ? null : num)
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-6 pt-6">
        <Text className="text-2xl font-bold text-foreground mb-2">{t.title}</Text>
        <Text className="text-sm text-muted-foreground mb-8">{t.subtitle}</Text>

        <MoneyInput
          label={currency}
          placeholder={t.placeholder}
          value={value}
          onChangeValue={handleChange}
          currency={currency}
          icon={DollarSign}
        />

        <View className="flex-1" />

        <Button
          size="lg"
          onPress={() => router.push("/(app)/(onboarding)/connect-account")}
          className="w-full mb-6"
        >
          <ButtonText size="lg">{t.cta}</ButtonText>
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}
