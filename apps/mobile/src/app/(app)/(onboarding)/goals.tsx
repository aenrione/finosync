import { View, Pressable, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
  BarChart3,
  PiggyBank,
  Wallet,
  ShoppingCart,
  Landmark,
  TrendingUp,
  Check,
} from "lucide-react-native"

import { Button, ButtonText } from "@/components/ui/button"
import { useTranslation } from "@/locale/onboarding/goals.text"
import { useStore } from "@/utils/store"
import { Text } from "@/components/ui/text"
import { colors } from "@/lib/colors"

export default function GoalsScreen() {
  const router = useRouter()
  const t = useTranslation()
  const { setOnboardingGoals, onboardingData } = useStore()
  const [selected, setSelected] = useState<string[]>(onboardingData.financialGoals)

  const goals = [
    { id: "track_spending", label: t.trackSpending, icon: BarChart3 },
    { id: "budget_better", label: t.budgetBetter, icon: Wallet },
    { id: "save_more", label: t.saveMore, icon: PiggyBank },
    { id: "manage_shopping", label: t.manageShopping, icon: ShoppingCart },
    { id: "connect_banks", label: t.connectBanks, icon: Landmark },
    { id: "track_investments", label: t.trackInvestments, icon: TrendingUp },
  ]

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((g) => g !== id)
      : [...selected, id]
    setSelected(next)
    setOnboardingGoals(next)
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
    >
      <Text className="text-2xl font-bold text-foreground mb-2">{t.title}</Text>
      <Text className="text-sm text-muted-foreground mb-6">{t.subtitle}</Text>

      <View className="flex-row flex-wrap gap-3 mb-8">
        {goals.map((goal) => {
          const isSelected = selected.includes(goal.id)
          return (
            <Pressable
              key={goal.id}
              onPress={() => toggle(goal.id)}
              className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border-2 ${
                isSelected ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}
            >
              <goal.icon size={18} color={isSelected ? colors.primary : colors.mutedForeground} />
              <Text className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                {goal.label}
              </Text>
              {isSelected ? <Check size={16} color={colors.primary} /> : null}
            </Pressable>
          )
        })}
      </View>

      <View className="flex-1" />

      <Button
        size="lg"
        onPress={() => router.push("/(app)/(onboarding)/income")}
        className="w-full mt-6"
      >
        <ButtonText size="lg">{t.cta}</ButtonText>
      </Button>
    </ScrollView>
  )
}
