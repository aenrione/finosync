import { ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { useTranslation } from "@/locale/app/add-account.text"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { View } from "react-native"
import { Wallet, Key, ShieldCheck, Mail, Link2 } from "lucide-react-native"

import { getAvailableAccountTypes, getAccountTypeConfig } from "@/constants/accountTypes"
import FintocWidgetModal from "@/components/screens/accounts/FintocWidgetModal"
import CurrenciesSelect from "@/components/search-selects/currencies"
import { AccountType, AccountFormData } from "@/types/account"
import { Button, ButtonText } from "@/components/ui/button"
import { useAccounts } from "@/context/accounts.context"
import { FormField } from "@/components/ui/form-field"
import { FormSelect } from "@/components/ui/form-select"
import { FormSection } from "@/components/ui/form-section"
import BackHeader from "@/components/back-header"
import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"

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

  const text = useTranslation()
  const router = useRouter()
  const { refreshData, createAccount } = useAccounts()

  const accountConfig = getAccountTypeConfig(selectedType)

  const isValid = () => {
    if (!accountName.trim()) return false
    if (accountConfig.usesWidget) return Boolean(primaryKey.trim())
    if (accountConfig.requiresCredentials) {
      if (accountConfig.requiresEmail && !email.trim()) return false
      if (!primaryKey.trim() || !secret.trim()) return false
    }
    return true
  }

  const handleSave = async (overridePrimaryKey?: string) => {
    const key = overridePrimaryKey ?? primaryKey
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

  const handleWidgetSuccess = (linkToken: string) => {
    setShowWidget(false)
    setPrimaryKey(linkToken)
    handleSave(linkToken)
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
    <View className="flex-1 bg-background">
      <BackHeader title={text.title} />

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

              {/* API Key - Buda */}
              {!accountConfig.requiresLink && accountConfig.requiresCredentials && (
                <FormField
                  label={text.apiKey}
                  value={primaryKey}
                  placeholder={text.apiKeyPlaceholder}
                  onChangeText={setPrimaryKey}
                  icon={Key}
                  required
                />
              )}

              {/* Secret */}
              {accountConfig.requiresCredentials && (
                <FormField
                  label={text.secret}
                  value={secret}
                  placeholder={text.secretPlaceholder}
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
            <ButtonText size="lg">
              {loading ? text.creating : text.save}
            </ButtonText>
          </Button>
        </View>
      )}
    </View>
  )
}

export default AddAccount
