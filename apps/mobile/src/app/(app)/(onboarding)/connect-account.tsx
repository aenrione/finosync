import { View, Pressable, ScrollView, Alert } from "react-native"
import { useState } from "react"
import { Wallet, Landmark, Bitcoin, TrendingUp } from "lucide-react-native"
import type { LucideIcon } from "lucide-react-native"

import { saveOnboardingPreferences } from "@/services/onboarding.service"
import { checkSession } from "@/services/auth.service"
import { useTranslation } from "@/locale/onboarding/connect-account.text"
import { getAvailableAccountTypes } from "@/constants/accountTypes"
import FintocWidgetModal from "@/components/screens/accounts/FintocWidgetModal"
import { Button, ButtonText } from "@/components/ui/button"
import { fetchWithAuth } from "@/utils/api"
import { FormField } from "@/components/ui/form-field"
import { CurrenciesSelect } from "@/components/search-selects/currencies"
import { useStore } from "@/utils/store"
import { Spinner } from "@/components/ui/spinner"
import { Text } from "@/components/ui/text"
import { colors } from "@/lib/colors"

const TYPE_ICONS: Record<string, LucideIcon> = {
  local: Wallet,
  fintoc: Landmark,
  buda: Bitcoin,
  fintual: TrendingUp,
}

const TYPE_DESCRIPTIONS: Record<string, { en: string; es: string }> = {
  local: { en: "Track accounts manually", es: "Rastrea cuentas manualmente" },
  fintoc: { en: "Connect your bank", es: "Conecta tu banco" },
  buda: { en: "Connect crypto exchange", es: "Conecta exchange de criptomonedas" },
  fintual: { en: "Connect investments", es: "Conecta inversiones" },
}

export default function ConnectAccountScreen() {
  const t = useTranslation()
  const { onboardingData, resetOnboarding } = useStore()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showWidget, setShowWidget] = useState(false)

  // Form state for inline account creation
  const [accountName, setAccountName] = useState("")
  const [currency, setCurrency] = useState<string | { code: string; name: string; symbol: string } | null>(onboardingData.preferredCurrency || null)
  const [apiKey, setApiKey] = useState("")
  const [secret, setSecret] = useState("")
  const [email, setEmail] = useState("")

  const accountTypes = getAvailableAccountTypes()

  const completeOnboarding = async () => {
    setSubmitting(true)
    try {
      await saveOnboardingPreferences({
        preferred_currency: onboardingData.preferredCurrency || undefined,
        monthly_income: onboardingData.monthlyIncome || undefined,
        financial_goals: onboardingData.financialGoals.length > 0 ? onboardingData.financialGoals : undefined,
        onboarding_completed: true,
      })

      // If monthly income was set, also set as quota
      if (onboardingData.monthlyIncome) {
        await fetchWithAuth("/user/set_quota", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quota: onboardingData.monthlyIncome }),
        })
      }

      resetOnboarding()
      // Re-fetch user so the layout sees onboarding_completed: true
      // The (app)/_layout.tsx will handle the transition to dashboard
      await checkSession()
    } catch (error: unknown) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save preferences")
    } finally {
      setSubmitting(false)
    }
  }

  const createAccount = async () => {
    if (!accountName.trim()) return

    setSubmitting(true)
    try {
      const config = accountTypes.find((a) => a.type === selectedType)
      const body: Record<string, unknown> = {
        account_name: accountName,
        account_type: selectedType,
      }

      if (config?.editable && currency) {
        body.currency = typeof currency === "string" ? currency : currency.code
      }
      if (config?.requiresCredentials) {
        body.primary_key = apiKey
        body.secret = secret
      }
      if (config?.requiresEmail) {
        body.primary_key = email
        body.secret = secret
      }

      const response = await fetchWithAuth("/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create account")
      }

      // Account created, complete onboarding
      await completeOnboarding()
    } catch (error: unknown) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create account")
      setSubmitting(false)
    }
  }

  if (submitting) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="large" />
      </View>
    )
  }

  const config = selectedType ? accountTypes.find((a) => a.type === selectedType) : null

  const handleWidgetSuccess = async (linkToken: string) => {
    setShowWidget(false)
    setSubmitting(true)
    try {
      const response = await fetchWithAuth("/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_name: "Bank Account",
          account_type: "fintoc",
          primary_key: linkToken,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create account")
      }
      await completeOnboarding()
    } catch (error: unknown) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to connect bank")
      setSubmitting(false)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-2xl font-bold text-foreground mb-2">{t.title}</Text>
      <Text className="text-sm text-muted-foreground mb-6">{t.subtitle}</Text>

      {!selectedType ? (
        <>
          {/* Account type cards */}
          <View className="gap-3 mb-8">
            {accountTypes.map((type) => {
              const Icon = TYPE_ICONS[type.type] || Wallet
              return (
                <Pressable
                  key={type.type}
                  onPress={() => {
                    if (type.usesWidget) {
                      setShowWidget(true)
                    } else {
                      setSelectedType(type.type)
                    }
                  }}
                  className="flex-row items-center gap-4 p-4 rounded-xl border-2 border-border bg-card"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon size={22} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{type.name}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {TYPE_DESCRIPTIONS[type.type]?.en || ""}
                    </Text>
                  </View>
                </Pressable>
              )
            })}
          </View>

          <View className="flex-1" />

          <Button
            variant="outline"
            size="lg"
            onPress={completeOnboarding}
            className="w-full"
          >
            <ButtonText variant="outline" size="lg">{t.skip}</ButtonText>
          </Button>
        </>
      ) : (
        <>
          {/* Inline form for selected type */}
          <Pressable onPress={() => setSelectedType(null)} className="mb-4">
            <Text className="text-sm text-primary font-medium">{"< Back to types"}</Text>
          </Pressable>

          <View className="bg-card rounded-xl p-5 border border-border gap-1">
            <FormField
              label="Account Name"
              placeholder="Ex: My checking account"
              value={accountName}
              onChangeText={setAccountName}
              required
            />

            {config?.editable ? (
              <CurrenciesSelect
                value={currency}
                onChange={setCurrency}
                label="Currency"
                required
              />
            ) : null}

            {config?.requiresEmail ? (
              <FormField
                label="Email"
                placeholder="example@account.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : null}

            {config?.requiresCredentials ? (
              <>
                <FormField
                  label="API Key"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChangeText={setApiKey}
                />
                <FormField
                  label="Secret"
                  placeholder="* * * *"
                  value={secret}
                  onChangeText={setSecret}
                  secureTextEntry
                />
              </>
            ) : null}
          </View>

          <View className="flex-1" />

          <View className="gap-3 mt-6">
            <Button
              size="lg"
              disabled={!accountName.trim()}
              onPress={createAccount}
              className="w-full"
            >
              <ButtonText size="lg">{t.done}</ButtonText>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onPress={completeOnboarding}
              className="w-full"
            >
              <ButtonText variant="outline" size="lg">{t.skip}</ButtonText>
            </Button>
          </View>
        </>
      )}

      <FintocWidgetModal
        visible={showWidget}
        onSuccess={handleWidgetSuccess}
        onExit={() => setShowWidget(false)}
      />
    </ScrollView>
  )
}
