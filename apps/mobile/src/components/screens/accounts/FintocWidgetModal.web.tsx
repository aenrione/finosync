import React, { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Modal, TouchableOpacity, View } from "react-native"
import { getFintoc } from "@fintoc/fintoc-js"
import { Text } from "@/components/ui/text"
import { fetchJsonWithAuth } from "@/utils/api"

const FINTOC_PUBLIC_KEY = process.env.EXPO_PUBLIC_FINTOC_PUBLIC_KEY ?? ""

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")

type Props = {
  visible: boolean
  onSuccess: (exchangeToken: string) => void
  onExit: () => void
}

const FintocWidgetModal = ({ visible, onSuccess, onExit }: Props) => {
  const widgetRef = useRef<{ open(): void; destroy(): void } | null>(null)
  const onSuccessRef = useRef(onSuccess)
  const onExitRef = useRef(onExit)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { onSuccessRef.current = onSuccess }, [onSuccess])
  useEffect(() => { onExitRef.current = onExit }, [onExit])

  useEffect(() => {
    if (isLocalhost) return

    if (!visible) {
      widgetRef.current?.destroy()
      widgetRef.current = null
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    // Step 1: Get widget_token from backend
    fetchJsonWithAuth<{ widget_token: string }>("/fintoc/link_intent", { method: "POST" })
      .then((data) => {
        if (cancelled) return
        return getFintoc().then((Fintoc) => {
          if (!Fintoc || cancelled) return

          // Step 2: Open widget with widgetToken
          const widget = Fintoc.create({
            publicKey: FINTOC_PUBLIC_KEY,
            holderType: "individual",
            country: "cl",
            widgetToken: data.widget_token,
            onSuccess: (linkIntent: Record<string, unknown>) => {
              const token = String(linkIntent?.exchangeToken ?? "")
              onSuccessRef.current(token)
            },
            onExit: () => onExitRef.current(),
          })

          widgetRef.current = widget
          setLoading(false)
          widget.open()
        })
      })
      .catch((err) => {
        if (cancelled) return
        setLoading(false)
        setError(err instanceof Error ? err.message : "Failed to connect to banking service")
      })

    return () => {
      cancelled = true
      widgetRef.current?.destroy()
      widgetRef.current = null
    }
  }, [visible])

  // Production: show loading or error overlay when needed, otherwise SDK renders its own overlay
  if (!isLocalhost && !loading && !error) return null

  if (!visible) return null

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onExit}>
      <View className="flex-1 bg-black/50 items-center justify-end">
        <View className="w-full bg-background rounded-t-2xl p-6 gap-3">
          {isLocalhost && (
            <>
              <Text className="text-base font-semibold text-foreground">Bank connection unavailable on localhost</Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                The Fintoc widget requires a deployed HTTPS origin to complete the
                bank-link flow. Use the iOS or Android app to test this feature, or
                deploy the web build to a real domain.
              </Text>
            </>
          )}
          {loading && (
            <View className="items-center py-4 gap-3">
              <ActivityIndicator size="large" />
              <Text className="text-sm text-muted-foreground">Connecting to banking service...</Text>
            </View>
          )}
          {error && (
            <>
              <Text className="text-base font-semibold text-foreground">Connection failed</Text>
              <Text className="text-sm leading-5 text-muted-foreground">{error}</Text>
            </>
          )}
          <TouchableOpacity className="mt-2 bg-foreground rounded-xl py-3.5 items-center" onPress={onExit}>
            <Text className="text-background font-semibold text-sm">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default FintocWidgetModal
