import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { QueryClient, QueryClientProvider } from "react-query"
import FontAwesome from "@expo/vector-icons/FontAwesome"

import "@/global.css"

import * as SplashScreen from "expo-splash-screen"
import { useRouter } from "expo-router"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { useEffect } from "react"
import "react-native-reanimated"

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider"
import { useColorScheme } from "@/components/theme/useColorScheme"
import { useStore } from "@/utils/store"

export {
  ErrorBoundary,
} from "expo-router"

export const unstable_settings = {
  initialRouteName: "(auth)",
}

SplashScreen.preventAutoHideAsync()

export function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  })
  const router = useRouter()
  const setRouter = (useStore.getState()).setRouter

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      setRouter(router)
      SplashScreen.hideAsync()
    }
  }, [loaded, router, setRouter])

  if (!loaded) {
    return null
  }

  return <GluestackUIProvider mode="light"><RootLayoutNav /></GluestackUIProvider>
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()

  return (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default RootLayout
