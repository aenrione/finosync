import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import React, { useState, useEffect } from "react"
import { Server } from "lucide-react-native"

import { Button, ButtonText } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Text } from "@/components/ui/text"

export default function SettingScreen() {
  const state = { baseUrl: "https://example.com" }
  const [currentUrl, setUrl] = useState(state.baseUrl || "https://")

  useEffect(() => {})

  const updateUrl = async () => {
    // store.dispatch(changeUrl({ url: currentUrl }));
    // navigation.navigate('SignIn');
  }

  const isValid = currentUrl.trim().length > 0 && currentUrl !== "https://"

  return (
    <SafeAreaView className="flex-1 bg-background">
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="bg-background"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-14 h-14 rounded-xl bg-primary/10 items-center justify-center mb-3">
              <Server size={24} color="#4F46E5" />
            </View>
            <Text className="text-2xl font-bold text-foreground">
              Server Settings
            </Text>
            <Text className="text-sm text-muted-foreground mt-1 text-center">
              Configure the API server for your FinoSync instance
            </Text>
          </View>

          {/* Form */}
          <View className="bg-card rounded-xl p-5 border border-border">
            <FormField
              label="Server URL"
              placeholder="https://your-server.com"
              value={currentUrl}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              icon={Server}
              required
              helperText="The base URL of your FinoSync API server"
              containerClassName="mb-2"
            />

            <Button
              disabled={!isValid}
              variant="secondary"
              onPress={updateUrl}
              className="w-full mt-3"
              size="lg"
            >
              <ButtonText variant="secondary" size="lg">
                Update Server URL
              </ButtonText>
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
