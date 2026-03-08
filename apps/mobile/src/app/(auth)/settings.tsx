import { View, ScrollView } from "react-native"
import React, { useState, useEffect } from "react"

import { Button, ButtonText } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"

export default function SettingScreen() {
  const state = { baseUrl: "https://example.com" }
  const [currentUrl, setUrl] = useState(state.baseUrl || "https://")

  useEffect(() => {})

  const updateUrl = async () => {
    // store.dispatch(changeUrl({ url: currentUrl }));
    // navigation.navigate('SignIn');
  }

  return (
    <ScrollView className="bg-background">
      <View className="flex-1 items-center px-5 mt-7 gap-3">
        <Text className="text-lg font-semibold text-muted-foreground">Server URL</Text>
        <Input placeholder="https://" value={currentUrl} onChangeText={setUrl} className="w-full" />
        <Button variant="secondary" onPress={updateUrl} className="w-full mt-2">
          <ButtonText variant="secondary">Update Base Url</ButtonText>
        </Button>
      </View>
    </ScrollView>
  )
}
