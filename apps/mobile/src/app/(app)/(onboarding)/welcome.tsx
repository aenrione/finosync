import { View, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { BarChart3, Landmark, Sparkles } from "lucide-react-native"

import { Button, ButtonText } from "@/components/ui/button"
import { useTranslation } from "@/locale/onboarding/welcome.text"
import { Text } from "@/components/ui/text"
import { colors } from "@/lib/colors"

export default function WelcomeScreen() {
  const router = useRouter()
  const t = useTranslation()

  const bullets = [
    { icon: BarChart3, text: t.bullet1 },
    { icon: Landmark, text: t.bullet2 },
    { icon: Sparkles, text: t.bullet3 },
  ]

  return (
    <View className="flex-1 bg-background justify-center px-6">
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      {/* Logo */}
      <View className="items-center mb-8">
        <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-primary shadow-sm">
          <Text className="text-2xl font-bold text-primary-foreground">FS</Text>
        </View>
      </View>

      {/* Headline */}
      <Text className="text-3xl font-bold text-foreground text-center mb-8">
        {t.headline}
      </Text>

      {/* Value props */}
      <View className="gap-4 mb-12">
        {bullets.map((item, i) => (
          <View key={i} className="flex-row items-center gap-4">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <item.icon size={22} color={colors.primary} />
            </View>
            <Text className="flex-1 text-base text-foreground">{item.text}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <Button
        size="lg"
        onPress={() => router.push("/(app)/(onboarding)/currency")}
        className="w-full"
      >
        <ButtonText size="lg">{t.cta}</ButtonText>
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbTop: {
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    backgroundColor: "rgba(79, 70, 229, 0.10)",
  },
  orbBottom: {
    bottom: -40,
    left: -50,
    width: 180,
    height: 180,
    backgroundColor: "rgba(79, 70, 229, 0.07)",
  },
})
