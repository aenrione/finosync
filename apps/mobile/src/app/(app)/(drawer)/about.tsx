import { ScrollView, View, Image, TouchableOpacity, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Constants from "expo-constants"

import { Text } from "@/components/ui/text"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Divider,
} from "@/components/ui/card"
import ScreenHeader from "@/components/screen-header"
import Icon from "@/components/ui/icon"
import { appName } from "@/constants/config"
import { useTranslation } from "@/locale/app/drawer/about.text"

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0"

const DEVELOPER = {
  name: "Alfredo Enrione",
  website: "https://aenrione.xyz",
  email: "aenrione@aenrione.xyz",
}

const APP_LINKS = {
  website: "https://finosync.aenrione.com",
  privacy: "https://finosync.aenrione.com/privacy",
  terms: "https://finosync.aenrione.com/terms",
}

const INTEGRATIONS = [
  {
    name: "Fintoc",
    logo: require("@/assets/images/fintoc-logo.png"),
    descKey: "fintocDesc" as const,
    url: "https://fintoc.com",
  },
  {
    name: "Buda",
    logo: require("@/assets/images/buda-logo.png"),
    descKey: "budaDesc" as const,
    url: "https://buda.com",
  },
  {
    name: "Fintual",
    logo: require("@/assets/images/fintual-logo.png"),
    descKey: "fintualDesc" as const,
    url: "https://fintual.cl",
  },
]

const FEATURES = [
  { icon: "Coins" as const, key: "featureMultiCurrency" as const },
  { icon: "Building2" as const, key: "featureBankSync" as const },
  { icon: "Bitcoin" as const, key: "featureCrypto" as const },
  { icon: "PiggyBank" as const, key: "featureBudget" as const },
  { icon: "ChartBar" as const, key: "featureCharts" as const },
  { icon: "Tags" as const, key: "featureCategories" as const },
]

const OSS_LIBRARIES = [
  { name: "React Native", url: "https://github.com/facebook/react-native" },
  { name: "Expo", url: "https://github.com/expo/expo" },
  { name: "NativeWind", url: "https://github.com/marklawlor/nativewind" },
  { name: "Zustand", url: "https://github.com/pmndrs/zustand" },
  { name: "TanStack Query", url: "https://github.com/TanStack/query" },
  { name: "Lucide Icons", url: "https://github.com/lucide-icons/lucide" },
  { name: "Expo Router", url: "https://github.com/expo/router" },
  { name: "React Native Reanimated", url: "https://github.com/software-mansion/react-native-reanimated" },
]

const openUrl = (url: string) => Linking.openURL(url)

export default function AboutScreen() {
  const text = useTranslation()
  const year = new Date().getFullYear()

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader variant="drawer" title={text.title} />
      <ScrollView
        contentContainerClassName="px-5 pb-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="items-center pt-8 pb-6">
          <View className="w-24 h-24 rounded-3xl bg-primary/10 items-center justify-center mb-4 overflow-hidden">
            <Image
              source={require("@/assets/images/wallet.png")}
              style={{ width: 56, height: 56 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-3xl font-bold text-foreground">{appName}</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {text.version} {APP_VERSION}
          </Text>
          <Text className="text-base text-primary font-medium mt-2">
            {text.tagline}
          </Text>
        </View>

        {/* Description */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <Text className="text-sm text-muted-foreground leading-6">
              {text.description}
            </Text>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <Icon name="Link" className="text-primary" size={18} />
              <CardTitle>{text.integrations}</CardTitle>
            </View>
            <CardDescription>{text.integrationsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {INTEGRATIONS.map((integration, index) => (
              <View key={integration.name}>
                <TouchableOpacity
                  className="flex-row items-center py-3"
                  onPress={() => openUrl(integration.url)}
                >
                  <View className="w-10 h-10 rounded-lg overflow-hidden bg-muted items-center justify-center">
                    <Image
                      source={integration.logo}
                      style={{ width: 32, height: 32 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {integration.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {text[integration.descKey]}
                    </Text>
                  </View>
                  <Icon
                    name="ExternalLink"
                    className="text-muted-foreground"
                    size={14}
                  />
                </TouchableOpacity>
                {index < INTEGRATIONS.length - 1 && <Divider />}
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <Icon name="Sparkles" className="text-primary" size={18} />
              <CardTitle>{text.features}</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <View className="flex-row flex-wrap gap-3">
              {FEATURES.map((feature) => (
                <View
                  key={feature.key}
                  className="flex-row items-center bg-muted rounded-lg px-3 py-2"
                >
                  <Icon
                    name={feature.icon}
                    className="text-primary mr-2"
                    size={16}
                  />
                  <Text className="text-xs font-medium text-foreground">
                    {text[feature.key]}
                  </Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Developer */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <Icon name="Code" className="text-primary" size={18} />
              <CardTitle>{text.developer}</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <View className="gap-3">
              <View className="flex-row items-center">
                <Icon
                  name="User"
                  className="text-muted-foreground mr-3"
                  size={16}
                />
                <Text className="text-sm text-foreground font-medium">
                  {DEVELOPER.name}
                </Text>
              </View>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => openUrl(DEVELOPER.website)}
              >
                <Icon
                  name="Globe"
                  className="text-muted-foreground mr-3"
                  size={16}
                />
                <Text className="text-sm text-primary">{DEVELOPER.website}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => openUrl(`mailto:${DEVELOPER.email}`)}
              >
                <Icon
                  name="Mail"
                  className="text-muted-foreground mr-3"
                  size={16}
                />
                <Text className="text-sm text-primary">{DEVELOPER.email}</Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <Icon name="ExternalLink" className="text-primary" size={18} />
              <CardTitle>{text.links}</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <LinkRow
              icon="Globe"
              label={text.appWebsite}
              onPress={() => openUrl(APP_LINKS.website)}
            />
            <Divider />
            <LinkRow
              icon="Shield"
              label={text.privacyPolicy}
              onPress={() => openUrl(APP_LINKS.privacy)}
            />
            <Divider />
            <LinkRow
              icon="FileText"
              label={text.termsOfService}
              onPress={() => openUrl(APP_LINKS.terms)}
            />
            <Divider />
            <LinkRow
              icon="Star"
              label={text.rateApp}
              onPress={() => {}}
            />
          </CardContent>
        </Card>

        {/* Open Source */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <Icon name="Heart" className="text-primary" size={18} />
              <CardTitle>{text.openSource}</CardTitle>
            </View>
            <CardDescription>{text.openSourceDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {OSS_LIBRARIES.map((lib, index) => (
              <View key={lib.name}>
                <TouchableOpacity
                  className="flex-row items-center justify-between py-2.5"
                  onPress={() => openUrl(lib.url)}
                >
                  <Text className="text-sm text-foreground">{lib.name}</Text>
                  <Icon
                    name="ExternalLink"
                    className="text-muted-foreground"
                    size={14}
                  />
                </TouchableOpacity>
                {index < OSS_LIBRARIES.length - 1 && <Divider />}
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Footer */}
        <View className="items-center py-8">
          <View className="flex-row items-center mb-2">
            <Text className="text-sm text-muted-foreground">
              {text.madeWith}{" "}
            </Text>
            <Icon name="Heart" className="text-red-500 mx-1" size={14} />
            <Text className="text-sm text-muted-foreground">
              {" "}{text.inChile}
            </Text>
          </View>
          <Text className="text-xs text-muted-foreground">
            © {year} {appName}. {text.copyright}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  label: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-2.5"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <Icon name={icon} className="text-muted-foreground mr-3" size={16} />
        <Text className="text-sm text-foreground">{label}</Text>
      </View>
      <Icon name="ChevronRight" className="text-muted-foreground" size={16} />
    </TouchableOpacity>
  )
}
