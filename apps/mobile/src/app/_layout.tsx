import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "react-query";

import "@/global.css";

import * as SplashScreen from "expo-splash-screen";
import {
  ErrorBoundaryProps,
  useRouter,
  router as globalRouter,
} from "expo-router";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from "@expo-google-fonts/ibm-plex-mono";

import RouteErrorState from "@/components/errors/route-error-state";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/components/theme/use-color-scheme";
import { useStore } from "@/utils/store";

const queryClient = new QueryClient();

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 bg-background">
      <RouteErrorState
        error={error}
        title="Something broke on this screen"
        onRetry={retry}
        onSecondaryAction={() =>
          globalRouter.replace("/(app)/(drawer)/(tabs)/dashboard")
        }
        secondaryLabel="Go to dashboard"
      />
      <View className="px-6 pb-8">
        <Text className="text-center text-xs text-muted-foreground">
          If this keeps happening, reopen the screen after the backend is
          healthy again.
        </Text>
      </View>
    </View>
  );
}

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

export function RootLayout() {
  const [loaded, error] = useFonts({
    "DM Sans": DMSans_400Regular,
    "DM Sans Medium": DMSans_500Medium,
    "DM Sans SemiBold": DMSans_600SemiBold,
    "DM Sans Bold": DMSans_700Bold,
    "IBM Plex Mono": IBMPlexMono_400Regular,
    "IBM Plex Mono Medium": IBMPlexMono_500Medium,
  });
  const router = useRouter();
  const setRouter = useStore.getState().setRouter;

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      setRouter(router);
      SplashScreen.hideAsync();
    }
  }, [loaded, router, setRouter]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default RootLayout;
