import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack, usePathname, useRouter } from "expo-router"
import type { Href } from "expo-router"
import { Pressable } from "react-native"
import { ChevronLeft } from "lucide-react-native"

import { Text } from "@/components/ui/text"
import { colors } from "@/lib/colors"

const STEPS = ["welcome", "currency", "goals", "income", "connect-account"]
const SKIPPABLE_FROM = 2 // goals (index 2) onwards

function getStepIndex(pathname: string): number {
  const segment = pathname.split("/").pop() || ""
  const idx = STEPS.indexOf(segment)
  return idx >= 0 ? idx : 0
}

export default function OnboardingLayout() {
  const pathname = usePathname()
  const router = useRouter()
  const stepIndex = getStepIndex(pathname)
  const progress = ((stepIndex + 1) / STEPS.length) * 100
  const showBack = stepIndex > 0
  const showSkip = stepIndex >= SKIPPABLE_FROM

  const handleSkip = () => {
    if (stepIndex < STEPS.length - 1) {
      const next = STEPS[stepIndex + 1]
      router.push(`/(app)/(onboarding)/${next}` as Href)
    } else {
      router.push("/(app)/(onboarding)/connect-account" as Href)
    }
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header with progress */}
      <SafeAreaView edges={["top"]} className="bg-background">
      <View className="px-4 pt-2 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          {/* Back button */}
          <View style={{ width: 60 }}>
            {showBack ? (
              <Pressable onPress={() => router.back()} hitSlop={8}>
                <ChevronLeft size={24} color={colors.foreground} />
              </Pressable>
            ) : null}
          </View>

          {/* Step indicator */}
          <Text className="text-xs text-muted-foreground">
            {stepIndex + 1} / {STEPS.length}
          </Text>

          {/* Skip button */}
          <View style={{ width: 60, alignItems: "flex-end" }}>
            {showSkip ? (
              <Pressable onPress={handleSkip} hitSlop={8}>
                <Text className="text-sm text-primary font-medium">Skip</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-1 rounded-full bg-border overflow-hidden">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>
      </SafeAreaView>

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="currency" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="income" />
        <Stack.Screen name="connect-account" />
      </Stack>
    </View>
  )
}
