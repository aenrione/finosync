import { useState } from "react"
import { Alert, Platform, KeyboardAvoidingView, ScrollView, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Constants from "expo-constants"

import ScreenHeader from "@/components/screen-header"
import { FormField } from "@/components/ui/form-field"
import { FormSection } from "@/components/ui/form-section"
import { Button, ButtonText } from "@/components/ui/button"
import { feedbackService } from "@/services/feedback.service"
import { useTranslation } from "@/locale/app/drawer/feedback.text"

const MIN_LENGTH = 10

export default function FeedbackScreen() {
  const text = useTranslation()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const isValid = content.trim().length >= MIN_LENGTH

  const getDeviceInfo = (): string => {
    return `${Platform.OS} ${Platform.Version}`
  }

  const handleSend = async () => {
    if (!isValid || loading) return
    setLoading(true)
    try {
      await feedbackService.create({
        content: content.trim(),
        app_version: Constants.expoConfig?.version ?? undefined,
        device_info: getDeviceInfo(),
      })
      Alert.alert(text.successTitle, text.successMessage)
      setContent("")
    } catch (error) {
      Alert.alert(
        text.errorTitle,
        error instanceof Error ? error.message : "Unknown error",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <ScreenHeader variant="drawer" title={text.title} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pt-4"
        >
          <FormSection
            title={text.sectionTitle}
            description={text.sectionDescription}
          >
            <FormField
              label={text.label}
              value={content}
              onChangeText={setContent}
              placeholder={text.placeholder}
              multiline
              numberOfLines={6}
              required
            />
          </FormSection>
        </ScrollView>

        <View className="px-5 py-4 border-t border-border">
          <Button
            disabled={!isValid || loading}
            onPress={handleSend}
            className="w-full"
          >
            <ButtonText>{loading ? text.sending : text.send}</ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
