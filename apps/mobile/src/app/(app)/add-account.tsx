import { ScrollView, Alert, KeyboardAvoidingView, Platform, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTranslation } from "@/locale/app/add-account.text"
import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "expo-router"
import { Wallet, Key, ShieldCheck, Mail, Link2, KeyRound } from "lucide-react-native"

import { getAvailableAccountTypes, getAccountTypeConfig } from "@/constants/accountTypes"
import FintocWidgetModal from "@/components/screens/accounts/FintocWidgetModal"
import CurrenciesSelect from "@/components/search-selects/currencies"
import { AccountType, AccountFormData } from "@/types/account"
import { Button, ButtonText } from "@/components/ui/button"
import { useAccounts } from "@/context/accounts.context"
import { accountService } from "@/services/accountService"
import { FormField } from "@/components/ui/form-field"
import { FormSelect } from "@/components/ui/form-select"
import { FormSection } from "@/components/ui/form-section"
import ScreenHeader from "@/components/screen-header"
import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"
import { fetchJsonWithAuth } from "@/utils/api"

const AVAILABLE_TYPES = getAvailableAccountTypes()

const AddAccount = () => {
  const [selectedType, setSelectedType] = useState<AccountType>("local")
  const [accountName, setAccountName] = useState("")
  const [primaryKey, setPrimaryKey] = useState("")
  const [secret, setSecret] = useState("")
  const [email, setEmail] = useState("")
  const [currency, setCurrency] = useState<{ code: string; name: string; symbol: string } | string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showWidget, setShowWidget] = useState(false)
  const [twoFAStep, setTwoFAStep] = useState<"idle" | "code">("idle")
  const [verificationCode, setVerificationCode] = useState("")
  const [resendCountdown, setResendCountdown] = useState(0)
  const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const text = useTranslation()
  const router = useRouter()
  const { refreshData, createAccount } = useAccounts()

  const accountConfig = getAccountTypeConfig(selectedType)

  const getButtonLabel = () => {
    if (loading) return text.creating
    if (accountConfig.uses2FA) {
      return twoFAStep === "code" ? text.fintual2FA.verify : text.fintual2FA.sendCode
    }
    return text.save
  }

  const startResendCountdown = useCallback(() => {
    setResendCountdown(60)
    if (resendTimer.current) clearInterval(resendTimer.current)
    resendTimer.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (resendTimer.current) clearInterval(resendTimer.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (resendTimer.current) clearInterval(resendTimer.current)
    }
  }, [])

  const handleResendCode = async () => {
    try {
      await accountService.fintualInitiateLogin(email.trim(), secret.trim())
      startResendCountdown()
    } catch (error) {
      Alert.alert(text.error, error instanceof Error ? error.message : text.createError)
    }
  }

  const isValid = () => {
    if (!accountName.trim()) return false
    if (accountConfig.usesWidget) return Boolean(primaryKey.trim())
    if (accountConfig.uses2FA && twoFAStep === "code") {
      return Boolean(verificationCode.trim())
    }
    if (accountConfig.requiresCredentials) {
      if (accountConfig.requiresEmail) {
        if (!email.trim() || !secret.trim()) return false
      } else {
        if (!primaryKey.trim() || !secret.trim()) return false
      }
    }
    return true
  }

  const handleSave = async (overridePrimaryKey?: string) => {
    if (accountConfig.uses2FA) {
      return handleFintual2FA()
    }
    const key = overridePrimaryKey ?? (accountConfig.requiresEmail ? email : primaryKey)
    setLoading(true)
    try {
      await createAccount({
        account_name: accountName.trim(),
        account_type: selectedType,
        primary_key: key.trim(),
        secret: secret.trim(),
        currency: currency ? (typeof currency === "string" ? currency : currency.code) : undefined,
      } as AccountFormData)
      await refreshData()
      router.back()
    } catch (error) {
      Alert.alert(text.error, error instanceof Error ? error.message : text.createError)
    } finally {
      setLoading(false)
    }
  }

  const handleFintual2FA = async () => {
    if (twoFAStep === "idle") {
      setLoading(true)
      try {
        await accountService.fintualInitiateLogin(email.trim(), secret.trim())
        setTwoFAStep("code")
        startResendCountdown()
      } catch (error) {
        Alert.alert(text.error, error instanceof Error ? error.message : text.createError)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        await accountService.fintualFinalizeLogin(
          email.trim(),
          secret.trim(),
          verificationCode.trim(),
          accountName.trim() || "Fintual"
        )
        await refreshData()
        router.back()
      } catch (error) {
        Alert.alert(text.error, error instanceof Error ? error.message : text.createError)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleWidgetSuccess = async (exchangeToken: string) => {
    setShowWidget(false)
    setLoading(true)
    try {
      await fetchJsonWithAuth("/fintoc/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchange_token: exchangeToken,
          account_name: accountName.trim() || "Bank Account",
          currency: currency ? (typeof currency === "string" ? currency : currency.code) : "CLP",
        }),
      })
      await refreshData()
      router.back()
    } catch (error) {
      Alert.alert(text.error, error instanceof Error ? error.message : text.createError)
    } finally {
      setLoading(false)
    }
  }

  const typeOptions = AVAILABLE_TYPES.map((type) => ({
    value: type.type,
    label: text.types[type.type as keyof typeof text.types],
  }))

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-muted-foreground">{text.loading}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title={text.title} variant="back" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="pt-2" />

          {/* Account Type */}
          <FormSection title="Account Type">
            <FormSelect
              label={text.accountType}
              options={typeOptions}
              value={selectedType}
              onValueChange={(value) => {
                setSelectedType(value as AccountType)
                setPrimaryKey("")
              }}
              required
              icon={Wallet}
              containerClassName="mb-0"
            />
          </FormSection>

          {/* Basic Info */}
          <FormSection title="Basic Info">
            <FormField
              label={text.accountName}
              value={accountName}
              placeholder={text.namePlaceholder}
              onChangeText={setAccountName}
              icon={Wallet}
              required
            />

            {/* Currency - Only for editable accounts */}
            {accountConfig.editable && (
              <CurrenciesSelect
                value={currency}
                onChange={(selected) => setCurrency(selected)}
                placeholder={text.selectCurrency}
                label={text.currency}
              />
            )}
          </FormSection>

          {/* Credentials - Only for accounts that need them */}
          {(accountConfig.requiresCredentials || accountConfig.requiresLink) && (
            <FormSection
              title="Credentials"
              description="These are securely stored and encrypted at rest."
            >
              {/* Email - Fintual */}
              {accountConfig.requiresEmail && (
                <FormField
                  label={text.email}
                  value={email}
                  placeholder={text.emailPlaceholder}
                  onChangeText={setEmail}
                  inputMode="email"
                  autoCapitalize="none"
                  icon={Mail}
                  required
                />
              )}

              {/* Link Token - Fintoc */}
              {accountConfig.requiresLink && (
                <FormField
                  label={text.linkToken}
                  value={primaryKey}
                  placeholder={text.linkTokenPlaceholder}
                  onChangeText={setPrimaryKey}
                  icon={Link2}
                  required
                />
              )}

              {/* API Key - Buda only (Fintual uses email as primary_key) */}
              {!accountConfig.requiresLink && accountConfig.requiresCredentials && !accountConfig.requiresEmail && (
                <FormField
                  label={text.apiKey}
                  value={primaryKey}
                  placeholder={text.apiKeyPlaceholder}
                  onChangeText={setPrimaryKey}
                  icon={Key}
                  required
                />
              )}

              {/* Secret / Password */}
              {accountConfig.requiresCredentials && (
                <FormField
                  label={accountConfig.requiresEmail ? text.password : text.secret}
                  value={secret}
                  placeholder={accountConfig.requiresEmail ? text.passwordPlaceholder : text.secretPlaceholder}
                  secureTextEntry
                  onChangeText={setSecret}
                  icon={ShieldCheck}
                  required
                  containerClassName="mb-0"
                />
              )}
            </FormSection>
          )}

          {/* Bank Connection (Fintoc widget) */}
          {accountConfig.usesWidget && (
            <FormSection title="Bank Connection">
              {primaryKey ? (
                <View className="flex-row items-center gap-3 p-3 rounded-lg bg-success-light border border-success/20">
                  <Icon name="CircleCheck" className="text-success" size={20} />
                  <Text className="text-sm font-semibold text-foreground flex-1">
                    {text.bank.connected}
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => { setPrimaryKey(""); setShowWidget(true) }}
                  >
                    <ButtonText variant="ghost" className="text-sm">
                      {text.bank.reconnect}
                    </ButtonText>
                  </Button>
                </View>
              ) : (
                <Button
                  onPress={() => setShowWidget(true)}
                  className="w-full"
                  size="lg"
                >
                  <ButtonText size="lg">{text.bank.connect}</ButtonText>
                </Button>
              )}
            </FormSection>
          )}

          {/* 2FA Verification Code - Fintual */}
          {accountConfig.uses2FA && twoFAStep === "code" && (
            <FormSection
              title={text.fintual2FA.title}
              description={text.fintual2FA.description}
            >
              <FormField
                label={text.fintual2FA.codeLabel}
                value={verificationCode}
                placeholder={text.fintual2FA.codePlaceholder}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                icon={KeyRound}
                required
              />
              <Button
                variant="ghost"
                size="sm"
                disabled={resendCountdown > 0}
                onPress={handleResendCode}
                className="self-center"
              >
                <ButtonText variant="ghost" className="text-sm">
                  {resendCountdown > 0
                    ? `${text.fintual2FA.resendIn} ${resendCountdown}s`
                    : text.fintual2FA.resend}
                </ButtonText>
              </Button>
            </FormSection>
          )}

          <FintocWidgetModal
            visible={showWidget}
            onSuccess={handleWidgetSuccess}
            onExit={() => setShowWidget(false)}
          />

          <View className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button — hidden for widget accounts */}
      {!accountConfig.usesWidget && (
        <View className="px-5 py-4 bg-background border-t border-border">
          <Button
            disabled={!isValid() || loading}
            onPress={() => handleSave()}
            className="w-full"
            size="lg"
          >
            <ButtonText size="lg">{getButtonLabel()}</ButtonText>
          </Button>
        </View>
      )}
    </SafeAreaView>
  )
}

export default AddAccount
