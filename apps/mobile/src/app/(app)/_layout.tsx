import {
  Animated,
  Easing,
  InteractionManager,
  StyleSheet,
  View,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Stack, useRouter } from "expo-router";

import { useTransactions } from "@/context/transactions.context";
import { useBalances } from "@/context/user-balance.context";
import { useCategories } from "@/context/categories.context";
import { useDashboard } from "@/context/dashboard.context";
import { GlobalProvider } from "@/context/global.context";
import { useAccounts } from "@/context/accounts.context";
import { checkSession } from "@/services/auth.service";
import { getToken } from "@/utils/store/session-store";
import { useCharts } from "@/context/charts.context";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { colors } from "@/lib/colors";

type StartupSplashProps = {
  message: string;
  opacity?: Animated.Value;
};

function StartupSplash({ message, opacity }: StartupSplashProps) {
  const content = (
    <>
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <View className="items-center px-8">
        <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-primary shadow-sm">
          <Text className="text-2xl font-bold text-primary-foreground">FS</Text>
        </View>

        <Text className="mt-6 text-4xl font-bold text-foreground">
          FinoSync
        </Text>
        <Text className="mt-3 text-center text-sm leading-6 text-muted-foreground">
          {message}
        </Text>

        <View className="mt-8">
          <Spinner size="large" />
        </View>
      </View>
    </>
  );

  if (opacity) {
    return (
      <Animated.View
        pointerEvents="auto"
        style={[styles.splash, StyleSheet.absoluteFillObject, { opacity }]}
      >
        {content}
      </Animated.View>
    );
  }

  return <View style={styles.splash}>{content}</View>;
}

function AppBootstrapShell() {
  const { loading: accountsLoading } = useAccounts();
  const { loading: dashboardLoading } = useDashboard();
  const { loading: transactionsLoading } = useTransactions();
  const { loading: balancesLoading } = useBalances();
  const { loading: categoriesLoading } = useCategories();
  const { loading: chartsLoading } = useCharts();
  const [hasLaidOut, setHasLaidOut] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const hasStartedExit = useRef(false);

  const isBootstrapping = useMemo(
    () =>
      [
        accountsLoading,
        dashboardLoading,
        transactionsLoading,
        balancesLoading,
        categoriesLoading,
        chartsLoading,
      ].some(Boolean),
    [
      accountsLoading,
      dashboardLoading,
      transactionsLoading,
      balancesLoading,
      categoriesLoading,
      chartsLoading,
    ],
  );

  useEffect(() => {
    if (isBootstrapping || !hasLaidOut || hasStartedExit.current) {
      return;
    }

    hasStartedExit.current = true;

    const interaction = InteractionManager.runAfterInteractions(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setShowSplash(false);
        }
      });
    });

    return () => {
      interaction.cancel();
    };
  }, [hasLaidOut, isBootstrapping, splashOpacity]);

  return (
    <View className="flex-1" onLayout={() => setHasLaidOut(true)}>
      <Stack>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="add-category" options={{ headerShown: false }} />
        <Stack.Screen name="add-recurring" options={{ headerShown: false }} />
        <Stack.Screen name="add-rule" options={{ headerShown: false }} />
        <Stack.Screen name="add-transaction" options={{ headerShown: false }} />
        <Stack.Screen name="add-account" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-shopping-list"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="shopping/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="shopping/[id]/add-item"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="transaction/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="account/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="transactions" options={{ headerShown: false }} />
      </Stack>

      {showSplash ? (
        <StartupSplash
          message="Syncing your finances and preparing the dashboard."
          opacity={splashOpacity}
        />
      ) : null}
    </View>
  );
}

export default function AppLayout() {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (!token) {
        router.replace("/(auth)/sign-in");
        return;
      }

      const user = await checkSession();
      if (!user) {
        router.replace("/(auth)/sign-in");
        return;
      }

      setReady(true);
    };
    checkAuth();
  }, [router]);

  if (!ready) {
    return (
      <StartupSplash message="Checking your session and connecting to the backend." />
    );
  }

  return (
    <GlobalProvider>
      <AppBootstrapShell />
    </GlobalProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbTop: {
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    backgroundColor: "rgba(79, 70, 229, 0.10)",
  },
  orbBottom: {
    bottom: -40,
    left: -50,
    width: 180,
    height: 180,
    backgroundColor: "rgba(79, 70, 229, 0.07)",
  },
});
