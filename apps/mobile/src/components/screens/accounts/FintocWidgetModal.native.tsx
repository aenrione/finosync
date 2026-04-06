import React, { useEffect, useState } from "react"
import { Modal, ActivityIndicator, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { WebView, WebViewNavigation } from "react-native-webview"
import { Text } from "@/components/ui/text"
import { fetchJsonWithAuth } from "@/utils/api"

const FINTOC_PUBLIC_KEY = process.env.EXPO_PUBLIC_FINTOC_PUBLIC_KEY ?? ""

function buildWidgetUrl(widgetToken: string): string {
  return (
    `https://webview.fintoc.com/widget.html` +
    `?public_key=${FINTOC_PUBLIC_KEY}` +
    `&holder_type=individual` +
    `&country=cl` +
    `&widget_token=${encodeURIComponent(widgetToken)}`
  )
}

type Props = {
  visible: boolean
  onSuccess: (exchangeToken: string) => void
  onExit: () => void
}

const FintocWidgetModal = ({ visible, onSuccess, onExit }: Props) => {
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) {
      setWidgetUrl(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchJsonWithAuth<{ widget_token: string }>("/fintoc/link_intent", { method: "POST" })
      .then((data) => {
        if (cancelled) return
        setWidgetUrl(buildWidgetUrl(data.widget_token))
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setLoading(false)
        setError(err instanceof Error ? err.message : "Failed to connect to banking service")
      })

    return () => { cancelled = true }
  }, [visible])

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState
    if (!url) return

    if (url.startsWith("fintocwidget://succeeded")) {
      const params = new URL(url).searchParams
      const exchangeToken = params.get("exchange_token") ?? params.get("link_token") ?? ""
      onSuccess(exchangeToken)
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

        {loading && (
          <View className="flex-1 items-center justify-center gap-3">
            <ActivityIndicator size="large" />
            <Text className="text-sm text-muted-foreground">Connecting to banking service...</Text>
          </View>
        )}

        {error && (
          <View className="flex-1 items-center justify-center p-6 gap-3">
            <Text className="text-base font-semibold text-foreground">Connection failed</Text>
            <Text className="text-sm text-center text-muted-foreground">{error}</Text>
            <TouchableOpacity className="mt-4 bg-foreground rounded-xl py-3.5 px-8" onPress={onExit}>
              <Text className="text-background font-semibold text-sm">Close</Text>
            </TouchableOpacity>
          </View>
        )}

        {widgetUrl && !loading && !error && (
          <WebView
            source={{ uri: widgetUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={(request) => {
              const { url } = request
              if (url.startsWith("fintocwidget://succeeded")) {
                const params = new URL(url).searchParams
                const exchangeToken = params.get("exchange_token") ?? params.get("link_token") ?? ""
                onSuccess(exchangeToken)
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
        )}
      </SafeAreaView>
    </Modal>
  )
}

export default FintocWidgetModal
