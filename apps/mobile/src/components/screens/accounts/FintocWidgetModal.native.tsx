import React from "react"
import { Modal, ActivityIndicator, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { WebView, WebViewNavigation } from "react-native-webview"
import { Text } from "@/components/ui/text"

const FINTOC_PUBLIC_KEY = process.env.EXPO_PUBLIC_FINTOC_PUBLIC_KEY ?? ""
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? ""
const FINTOC_WEBHOOK_URL = `${API_URL}/webhooks/fintoc`

const WIDGET_URL =
  `https://webview.fintoc.com/widget.html` +
  `?public_key=${FINTOC_PUBLIC_KEY}` +
  `&product=movements` +
  `&holder_type=individual` +
  `&country=cl` +
  `&webhook_url=${encodeURIComponent(FINTOC_WEBHOOK_URL)}`

type Props = {
  visible: boolean
  onSuccess: (linkToken: string) => void
  onExit: () => void
}

const FintocWidgetModal = ({ visible, onSuccess, onExit }: Props) => {
  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState
    if (!url) return

    if (url.startsWith("fintocwidget://succeeded")) {
      const params = new URL(url).searchParams
      const linkToken = params.get("link_token") ?? ""
      onSuccess(linkToken)
    } else if (url.startsWith("fintocwidget://exit")) {
      onExit()
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onExit}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Text className="text-base font-semibold text-foreground">Connect your bank</Text>
          <TouchableOpacity onPress={onExit} className="p-2">
            <Text className="text-lg text-foreground">✕</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: WIDGET_URL }}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={(request) => {
            const { url } = request
            if (url.startsWith("fintocwidget://succeeded")) {
              const params = new URL(url).searchParams
              const linkToken = params.get("link_token") ?? ""
              onSuccess(linkToken)
              return false
            }
            if (url.startsWith("fintocwidget://exit")) {
              onExit()
              return false
            }
            return true
          }}
          startInLoadingState
          renderLoading={() => (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" />
            </View>
          )}
          className="flex-1"
        />
      </SafeAreaView>
    </Modal>
  )
}

export default FintocWidgetModal
