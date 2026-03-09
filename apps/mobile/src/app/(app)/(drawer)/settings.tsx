import {
  ScrollView,
  View,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
  Modal,
  Pressable,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useQueryClient } from "react-query"
import React, { useState } from "react"
import Constants from "expo-constants"

import { useTranslation } from "@/locale/app/drawer/settings.text"
import { Card, CardContent, Divider } from "@/components/ui/card"
import { APP_LANGUAGES } from "@/shared/locale/config"
import ScreenHeader from "@/components/screen-header"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"
import { colors } from "@/lib/colors"

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0"

const CURRENCIES = ["CLP", "USD", "EUR", "BTC"]

const APP_LINKS = {
  privacy: "https://finosync.aenrione.xyz/privacy",
  terms: "https://finosync.aenrione.xyz/terms",
}

type SettingIcon = NonNullable<React.ComponentProps<typeof Icon>["name"]>;

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground px-1 pt-6 pb-3">
      {title}
    </Text>
  )
}

function SettingRow({
  icon,
  label,
  description,
  right,
  onPress,
  destructive,
}: {
  icon: SettingIcon;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const content = (
    <View className="flex-row items-center py-3.5">
      <View
        className={`w-9 h-9 rounded-xl items-center justify-center ${
          destructive ? "bg-destructive/10" : "bg-muted"
        }`}
      >
        <Icon
          name={icon}
          size={17}
          color={destructive ? colors.error : colors.mutedForeground}
        />
      </View>
      <View className="flex-1 ml-3">
        <Text
          className={`text-sm font-medium ${
            destructive ? "text-destructive" : "text-foreground"
          }`}
        >
          {label}
        </Text>
        {description ? (
          <Text className="text-xs text-muted-foreground mt-0.5">
            {description}
          </Text>
        ) : null}
      </View>
      {right ?? (
        <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
      )}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

function SettingToggle({
  icon,
  label,
  description,
  value,
  onValueChange,
}: {
  icon: SettingIcon;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <SettingRow
      icon={icon}
      label={label}
      description={description}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.muted, true: colors.primary + "60" }}
          thumbColor={value ? colors.primary : colors.neutral[300]}
        />
      }
    />
  )
}

function OptionPicker<T extends string>({
  value,
  onChange,
  options,
  labels,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  labels: Record<string, string>;
}) {
  return (
    <View className="flex-row flex-wrap gap-2 mt-2 mb-1">
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          className={`px-4 py-2 rounded-xl border ${
            value === option
              ? "bg-primary/10 border-primary"
              : "bg-card border-border"
          }`}
          onPress={() => onChange(option)}
        >
          <Text
            className={`text-sm font-medium ${
              value === option ? "text-primary" : "text-foreground"
            }`}
          >
            {labels[option] || option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default function SettingsScreen() {
  const text = useTranslation()
  const queryClient = useQueryClient()

  const isVisible = useStore((s) => s.isVisible)
  const toggleVisibility = useStore((s) => s.toggleVisibility)
  const baseCurrency = useStore((s) => s.baseCurrency)
  const setBaseCurrency = useStore((s) => s.setBaseCurrency)
  const language = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)
  const url = useStore((s) => s.url)
  const setUrl = useStore((s) => s.setUrl)
  const transactionAlerts = useStore((s) => s.transactionAlerts)
  const setTransactionAlerts = useStore((s) => s.setTransactionAlerts)
  const budgetWarnings = useStore((s) => s.budgetWarnings)
  const setBudgetWarnings = useStore((s) => s.setBudgetWarnings)

  const handleCurrencyChange = (currency: string) => {
    setBaseCurrency(currency)
    queryClient.invalidateQueries()
  }

  const [urlModalVisible, setUrlModalVisible] = useState(false)
  const [tempUrl, setTempUrl] = useState(url)

  const handleSaveUrl = () => {
    setUrl(tempUrl)
    setUrlModalVisible(false)
  }

  const handleClearCache = () => {
    queryClient.clear()
    Alert.alert(text.clearCache, text.cacheCleared)
  }

  const handleDeleteAccount = () => {
    Alert.alert(text.deleteAccount, text.deleteAccountDesc, [
      { text: text.cancel, style: "cancel" },
      {
        text: text.deleteAccount,
        style: "destructive",
        onPress: () => {
          // TODO: implement account deletion API call
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <ScreenHeader title={text.title} variant="back" />
      <ScrollView
        contentContainerClassName="px-5 pb-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Display */}
        <SectionHeader title={text.display} />
        <Card>
          <CardContent className="pt-3">
            <SettingToggle
              icon="EyeOff"
              label={text.hideBalances}
              description={text.hideBalancesDesc}
              value={!isVisible}
              onValueChange={() => toggleVisibility()}
            />
            <Divider />
            <View>
              <SettingRow
                icon="Globe"
                label={text.language}
                description={text.languageDesc}
                right={<View />}
              />
              <OptionPicker
                value={language}
                onChange={setLanguage}
                options={APP_LANGUAGES}
                labels={text.languages}
              />
            </View>
            <Divider />
            <View>
              <SettingRow
                icon="Coins"
                label={text.baseCurrency}
                description={text.baseCurrencyDesc}
                right={<View />}
              />
              <OptionPicker
                value={baseCurrency}
                onChange={handleCurrencyChange}
                options={CURRENCIES}
                labels={text.currencies}
              />
            </View>
          </CardContent>
        </Card>

        {/* Notifications */}
        <SectionHeader title={text.notifications} />
        <Card>
          <CardContent className="pt-3">
            <SettingToggle
              icon="Bell"
              label={text.transactionAlerts}
              description={text.transactionAlertsDesc}
              value={transactionAlerts}
              onValueChange={setTransactionAlerts}
            />
            <Divider />
            <SettingToggle
              icon="CircleAlert"
              label={text.budgetWarnings}
              description={text.budgetWarningsDesc}
              value={budgetWarnings}
              onValueChange={setBudgetWarnings}
            />
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <SectionHeader title={text.dataPrivacy} />
        <Card>
          <CardContent className="pt-3">
            <SettingRow
              icon="Server"
              label={text.apiServer}
              description={url}
              onPress={() => {
                setTempUrl(url)
                setUrlModalVisible(true)
              }}
            />
            <Divider />
            <SettingRow
              icon="Shield"
              label={text.privacyPolicy}
              onPress={() => Linking.openURL(APP_LINKS.privacy)}
            />
            <Divider />
            <SettingRow
              icon="FileText"
              label={text.termsOfService}
              onPress={() => Linking.openURL(APP_LINKS.terms)}
            />
          </CardContent>
        </Card>

        {/* Danger zone */}
        <SectionHeader title={text.dangerZone} />
        <Card>
          <CardContent className="pt-3">
            <SettingRow
              icon="Trash2"
              label={text.clearCache}
              description={text.clearCacheDesc}
              onPress={handleClearCache}
            />
            <Divider />
            <SettingRow
              icon="UserX"
              label={text.deleteAccount}
              description={text.deleteAccountDesc}
              onPress={handleDeleteAccount}
              destructive
            />
          </CardContent>
        </Card>

        {/* Version footer */}
        <View className="items-center pt-8 pb-4">
          <Text className="text-xs text-muted-foreground">
            {text.version} {APP_VERSION}
          </Text>
        </View>
      </ScrollView>

      {/* URL Edit Modal */}
      <Modal
        visible={urlModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUrlModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => setUrlModalVisible(false)}
        >
          <Pressable
            className="bg-card w-full rounded-2xl p-5"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-semibold text-foreground mb-1">
              {text.editServerUrl}
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              {text.apiServerDesc}
            </Text>
            <Input
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder={text.serverUrlPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              className="border border-border mb-4"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border border-border items-center"
                onPress={() => setUrlModalVisible(false)}
              >
                <Text className="text-sm font-medium text-foreground">
                  {text.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl bg-primary items-center"
                onPress={handleSaveUrl}
              >
                <Text className="text-sm font-medium text-primary-foreground">
                  {text.save}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}
