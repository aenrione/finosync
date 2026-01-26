import { Stack } from "expo-router"

import { GlobalProvider } from "@/context/global.context"

export default function AppLayout() {
  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="add-category" options={{ headerShown: false }} />
        <Stack.Screen name="add-transaction" options={{ headerShown: false }} />
        <Stack.Screen name="add-account" options={{ headerShown: false }} />
        <Stack.Screen name="add-budget" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="budget" options={{ headerShown: false }} />
        <Stack.Screen name="transaction" options={{ headerShown: false }} />
        <Stack.Screen name="transaction/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="account/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
        <Stack.Screen name="transactions" options={{ headerShown: false }} />
      </Stack>
    </GlobalProvider>
  )
} 