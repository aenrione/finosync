import { ScrollView, Alert } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useTranslation } from "@/locale/app/add-account.text"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { View } from "react-native"

import { getAvailableAccountTypes, getAccountTypeConfig } from "@/constants/accountTypes"
import FintocWidgetModal from "@/components/screens/accounts/FintocWidgetModal"
import CurrenciesSelect from "@/components/search-selects/currencies"
import { AccountType, AccountFormData } from "@/types/account"
import { Button, ButtonText } from "@/components/ui/button"
import { useAccounts } from "@/context/accounts.context"
import BackHeader from "@/components/back-header"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"

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
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Account Type Section */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-muted-foreground mb-1.5">
            {text.accountType}
          </Text>
          <View className="bg-muted rounded-xl overflow-hidden border border-border">
            <Picker
              selectedValue={selectedType}
              onValueChange={(value: AccountType) => {
                setSelectedType(value)
                setPrimaryKey("")
              }}
            >
              {AVAILABLE_TYPES.map((type) => (
                <Picker.Item
                  key={type.type}
                  label={text.types[type.type as keyof typeof text.types]}
                  value={type.type}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Account Name Section */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-muted-foreground mb-1.5">
            {text.accountName}
            <Text className="text-destructive ml-1">*</Text>
          </Text>
          <Input
            value={accountName}
            placeholder={text.namePlaceholder}
            onChangeText={setAccountName}
            className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[56px]"
          />
        </View>

        {/* Currency Section - Only for editable accounts */}
        {accountConfig.editable && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-muted-foreground mb-1.5">
              {text.currency}
            </Text>
            <View className="bg-muted rounded-xl overflow-hidden border border-border">
              <CurrenciesSelect
                value={currency}
                onChange={(selected) => setCurrency(selected)}
                placeholder={text.selectCurrency}
                className="mt-2"
              />
            </View>
          </View>
        )}

        {/* Email Section - For Fintual accounts */}
        {accountConfig.requiresEmail && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-muted-foreground mb-1.5">
              {text.email}
              <Text className="text-destructive ml-1">*</Text>
            </Text>
            <Input
              inputMode="email"
              value={email}
              placeholder={text.emailPlaceholder}
              onChangeText={setEmail}
              className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[56px]"
            />
          </View>
        )}

        {/* Link Token Section - For Fintoc accounts */}
        {accountConfig.requiresLink && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-muted-foreground mb-1.5">
              {text.linkToken}
              <Text className="text-destructive ml-1">*</Text>
            </Text>
            <Input
              value={primaryKey}
              placeholder={text.linkTokenPlaceholder}
              onChangeText={setPrimaryKey}
              className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[56px]"
            />
          </View>
        )}

        {/* API Key Section - For Buda accounts */}
        {!accountConfig.requiresLink && accountConfig.requiresCredentials && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-muted-foreground mb-1.5">
              {text.apiKey}
              <Text className="text-destructive ml-1">*</Text>
            </Text>
            <Input
              value={primaryKey}
              placeholder={text.apiKeyPlaceholder}
              onChangeText={setPrimaryKey}
              className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[56px]"
            />
          </View>
        )}

        {/* Secret Section - For accounts requiring credentials */}
        {accountConfig.requiresCredentials && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-muted-foreground mb-1.5">
              {text.secret}
              <Text className="text-destructive ml-1">*</Text>
            </Text>
            <Input
              value={secret}
              placeholder={text.secretPlaceholder}
              secureTextEntry
              onChangeText={setSecret}
              className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[56px]"
            />
          </View>
        )}

        {/* Fintoc widget — opens after bank type is selected */}
        {accountConfig.usesWidget && (
          <View className="mb-6">
            {primaryKey ? (
              <View className="bg-muted border border-border rounded-xl p-4 flex-row items-center gap-3">
                <Text className="text-sm font-semibold text-foreground flex-1">{text.bank.connected}</Text>
                <Button variant="ghost" onPress={() => { setPrimaryKey(""); setShowWidget(true) }}>
                  <ButtonText variant="ghost" className="text-sm">{text.bank.reconnect}</ButtonText>
                </Button>
              </View>
            ) : (
              <Button onPress={() => setShowWidget(true)} className="rounded-xl py-4">
                <ButtonText>{text.bank.connect}</ButtonText>
              </Button>
            )}
          </View>
        )}

        <FintocWidgetModal
          visible={showWidget}
          onSuccess={handleWidgetSuccess}
          onExit={() => setShowWidget(false)}
        />
      </ScrollView>

      {/* Save Button — hidden for widget accounts (save happens automatically on widget success) */}
      {!accountConfig.usesWidget && (
        <View className="p-6 bg-background border-t border-border">
          <Button
            disabled={!isValid() || loading}
            onPress={() => handleSave()}
            className="w-full rounded-xl py-4"
          >
            <ButtonText>{loading ? text.creating : text.save}</ButtonText>
          </Button>
        </View>
      )}
    </View>
  )
}

export default AddAccount
