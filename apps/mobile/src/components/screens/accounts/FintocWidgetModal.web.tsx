import React, { useEffect, useRef } from "react"
import { Modal, TouchableOpacity, View } from "react-native"
import { getFintoc } from "@fintoc/fintoc-js"
import { Text } from "@/components/ui/text"

const FINTOC_PUBLIC_KEY = process.env.EXPO_PUBLIC_FINTOC_PUBLIC_KEY ?? ""
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? ""
const FINTOC_WEBHOOK_URL = `${API_URL}/webhooks/fintoc`

// The Fintoc JS SDK requires a deployed HTTPS origin — postMessage between
// wizard.fintoc.com and a localhost parent is blocked by the browser's
// same-origin policy. Show a notice in development and let the SDK run in prod.
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")

type Props = {
  visible: boolean
  onSuccess: (linkToken: string) => void
  onExit: () => void
}

const FintocWidgetModal = ({ visible, onSuccess, onExit }: Props) => {
  const widgetRef = useRef<{ open(): void; destroy(): void } | null>(null)
  const onSuccessRef = useRef(onSuccess)
  const onExitRef = useRef(onExit)

  useEffect(() => { onSuccessRef.current = onSuccess }, [onSuccess])
  useEffect(() => { onExitRef.current = onExit }, [onExit])

  useEffect(() => {
    // Skip SDK initialisation on localhost — it cannot complete the
    // cross-origin postMessage handshake with wizard.fintoc.com.
    if (isLocalhost) return

    if (!visible) {
      widgetRef.current?.destroy()
      widgetRef.current = null
      return
    }

    let cancelled = false

    getFintoc().then((Fintoc) => {
      if (!Fintoc || cancelled) return

      const widget = Fintoc.create({
        publicKey: FINTOC_PUBLIC_KEY,
        product: "movements",
        holderType: "individual",
        country: "cl",
        webhookUrl: FINTOC_WEBHOOK_URL,
        onSuccess: (linkIntent: Record<string, unknown>) => {
          const token = String(linkIntent?.link_token ?? linkIntent?.exchangeToken ?? "")
          onSuccessRef.current(token)
        },
        onExit: () => onExitRef.current(),
      })

      widgetRef.current = widget
      widget.open()
    })

    return () => {
      cancelled = true
      widgetRef.current?.destroy()
      widgetRef.current = null
    }
  }, [visible])

  // Production: the SDK renders its own full-page overlay — nothing to render here.
  if (!isLocalhost) return null

  // Development: show a modal explaining the limitation.
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onExit}>
      <View className="flex-1 bg-black/50 items-center justify-end">
        <View className="w-full bg-background rounded-t-2xl p-6 gap-3">
          <Text className="text-base font-semibold text-foreground">Bank connection unavailable on localhost</Text>
          <Text className="text-sm leading-5 text-muted-foreground">
            The Fintoc widget requires a deployed HTTPS origin to complete the
            bank-link flow. Use the iOS or Android app to test this feature, or
            deploy the web build to a real domain.
          </Text>
          <TouchableOpacity className="mt-2 bg-foreground rounded-xl py-3.5 items-center" onPress={onExit}>
            <Text className="text-background font-semibold text-sm">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default FintocWidgetModal
