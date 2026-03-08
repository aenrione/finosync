import { ScrollView, Modal } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useTranslation } from "react-i18next"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { View } from "react-native"

import { ACCOUNT_TYPES, getAccountTypeConfig } from "@/constants/accountTypes"
import CurrenciesSelect from "@/components/search-selects/currencies"
import { AccountType, AccountFormData } from "@/types/account"
import { Button, ButtonText } from "@/components/ui/button"
import { useAccounts } from "@/context/accounts.context"
import BackHeader from "@/components/back-header"
import DeleteAlert from "@/components/delete-alert"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"

const AddAccount = () => {
  const [selectedType, setSelectedType] = useState<AccountType>("local")
  const [accountName, setAccountName] = useState("")
  const [primaryKey, setPrimaryKey] = useState("")
  const [secret, setSecret] = useState("")
  const [email, setEmail] = useState("")
  const [currency, setCurrency] = useState<{ code: string; name: string; symbol: string } | string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const { t } = useTranslation()
  const router = useRouter()
  const { refreshData, createAccount } = useAccounts()

  const accountConfig = getAccountTypeConfig(selectedType)

  const isValid = () => {
    if (!accountName.trim()) return false
    if (accountConfig.requiresCredentials) {
      if (accountConfig.requiresEmail && !email.trim()) return false
      if (!primaryKey.trim() || !secret.trim()) return false
    }
    return true
  }

  const handleSave = async () => {
    if (!isValid()) return

    setLoading(true)
    try {
      await createAccount({
        account_name: accountName.trim(),
        account_type: selectedType,
        primary_key: primaryKey.trim(),
        secret: secret.trim(),
        currency: currency ? (typeof currency === "string" ? currency : currency.code) : undefined,
      } as AccountFormData)
      await refreshData()
      router.back()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("new_account.create_error"))
      setShowErrorDialog(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-muted-foreground">{t("loading")}</Text>
      </View>
    )
  }

  const closeModal = () => setShowModal(false)
  const closeErrorDialog = () => setShowErrorDialog(false)

  return (
    <View className="flex-1 bg-background">
      <BackHeader title={t("new_account.title")} />
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Account Type Section */}
        <View className="mb-6">
          <Text className="text-muted-foreground font-semibold text-sm mb-3">
            {t("new_account.account_type")}
          </Text>
          <View className="bg-muted rounded-xl overflow-hidden border border-border">
            <Picker
              selectedValue={selectedType}
              onValueChange={(value: AccountType) => setSelectedType(value)}
            >
              {ACCOUNT_TYPES.map((type) => (
                <Picker.Item
                  key={type.type}
                  label={t(`new_account.types.${type.type}`)}
                  value={type.type}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Account Name Section */}
        <View className="mb-6">
          <Text className="text-muted-foreground font-semibold text-sm mb-3">
            {t("new_account.account_name")}
            <Text className="text-destructive ml-1">*</Text>
          </Text>
          <Input
            value={accountName}
            placeholder={t("new_account.name_placeholder")}
            onChangeText={setAccountName}
            className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[56px]"
          />
        </View>

        {/* Currency Section - Only for editable accounts */}
        {accountConfig.editable && (
          <View className="mb-6">
            <Text className="text-muted-foreground font-semibold text-sm mb-3">
              {t("new_account.currency")}
            </Text>
            <View className="bg-muted rounded-xl overflow-hidden border border-border">
              <CurrenciesSelect
                value={currency}
                onChange={(selected) => setCurrency(selected)}
                placeholder={t("new_account.select_currency")}
                className="mt-2"
              />
            </View>
          </View>
        )}

        {/* Email Section - For Fintual accounts */}
        {accountConfig.requiresEmail && (
          <View className="mb-6">
            <Text className="text-muted-foreground font-semibold text-sm mb-3">
              {t("new_account.email")}
              <Text className="text-destructive ml-1">*</Text>
            </Text>
            <Input
              inputMode="email"
              value={email}
              placeholder={t("new_account.email_placeholder")}
              onChangeText={setEmail}
              className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[56px]"
            />
          </View>
        )}

        {/* Link Token Section - For Fintoc accounts */}
        {accountConfig.requiresLink && (
          <View className="mb-6">
            <Text className="text-muted-foreground font-semibold text-sm mb-3">
              {t("new_account.link_token")}
              <Text className="text-destructive ml-1">*</Text>
            </Text>
            <Input
              value={primaryKey}
              placeholder={t("new_account.link_token_placeholder")}
              onChangeText={setPrimaryKey}
              className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[56px]"
            />
          </View>
        )}

        {/* API Key Section - For Buda accounts */}
        {!accountConfig.requiresLink && accountConfig.requiresCredentials && (
          <View className="mb-6">
            <Text className="text-muted-foreground font-semibold text-sm mb-3">
              {t("new_account.api_key")}
              <Text className="text-destructive ml-1">*</Text>
            </Text>
            <Input
              value={primaryKey}
              placeholder={t("new_account.api_key_placeholder")}
              onChangeText={setPrimaryKey}
              className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[56px]"
            />
          </View>
        )}

        {/* Secret Section - For accounts requiring credentials */}
        {accountConfig.requiresCredentials && (
          <View className="mb-6">
            <Text className="text-muted-foreground font-semibold text-sm mb-3">
              {t("new_account.secret")}
              <Text className="text-destructive ml-1">*</Text>
            </Text>
            <Input
              value={secret}
              placeholder={t("new_account.secret_placeholder")}
              secureTextEntry
              onChangeText={setSecret}
              className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[56px]"
            />
          </View>
        )}

        {/* Modal for additional account setup */}
        <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
          <View className="flex-1 bg-muted">
            <ScrollView contentContainerClassName="flex-1 items-center justify-center">
              <Text className="text-foreground text-lg">{t("new_account.modal_content", { type: selectedType })}</Text>
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>

      {/* Save Button */}
      <View className="p-6 bg-background border-t border-border">
        <Button
          disabled={!isValid() || loading}
          onPress={handleSave}
          className="rounded-xl py-4"
        >
          <ButtonText>{loading ? t("creating") : t("save")}</ButtonText>
        </Button>
      </View>
    </View>
  )
}

export default AddAccount
