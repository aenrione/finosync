import { useTranslation } from "react-i18next"
import { Alert, Platform } from "react-native"
import React from "react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,
} from "@/components/ui/alert-dialog"
import { Button, ButtonText } from "@/components/ui/button"
import { Text, View } from "@/components/theme/Themed"
import { Heading } from "@/components/ui/heading"

type DeleteAlertProps = {
        isOpen: boolean;
        onClose: () => void;
        onDelete: () => void;
        errorMessage?: string;
        title?: string;
};

// Define alert option type
type AlertOption = {
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
};

// Web alert polyfill
const alertPolyfill = (title: string, description: string | undefined, options: AlertOption[]) => {
  const result = window.confirm([title, description].filter(Boolean).join("\n"))

  if (result) {
    const confirmOption = options.find(({ style }) => style !== "cancel")
    confirmOption?.onPress?.()
  } else {
    const cancelOption = options.find(({ style }) => style === "cancel")
    cancelOption?.onPress?.()
  }
}


const DeleteAlert = ({
  isOpen,
  onClose,
  onDelete,
  errorMessage,
  title,
}: DeleteAlertProps) => {
    
  const { t } = useTranslation()
    
  return (
    <View className="flex-1 bg-background">
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        size="md"
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading className="text-typography-950 font-semibold" size="md">
              {title || t("delete.confirm_title")}
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3 mb-4">
            <Text className="text-sm">
              {errorMessage || t("delete.confirm_message")}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              size="sm"
              onPress={onClose}
              className="mr-3"
            >
              <ButtonText>{t("cancel")}</ButtonText>
            </Button>
            <Button
              size="sm"
              onPress={() => { onDelete(); onClose() }}
              className="bg-red-500"
            >
              <ButtonText>{t("delete")}</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  )
}

// Platform-specific alert implementation
const platformAlert: typeof Alert.alert = Platform.OS === "web" 
  ? alertPolyfill as any // Type assertion needed for compatibility
  : Alert.alert

const DeleteAlertWrapper = (props: DeleteAlertProps) => {
  const { isOpen, onClose, onDelete, errorMessage, title } = props
  const { t } = useTranslation()

  // For web platform, use the polyfill directly in useEffect
  React.useEffect(() => {
    if (Platform.OS === "web" && isOpen) {
      console.log("Web platform detected, showing alert dialog")
      try {
        platformAlert(
          title || t("delete.confirm_title"),
          errorMessage || t("delete.confirm_message"),
          [
            { text: t("cancel"), style: "cancel", onPress: () => {
              console.log("Cancel pressed")
              onClose()
            }},
            { text: t("delete"), style: "destructive", onPress: () => {
              console.log("Delete pressed")
              onDelete()
              onClose()
            }}
          ]
        )
      } catch (error) {
        console.error("Error showing alert:", error)
      }
    }
  }, [isOpen, title, errorMessage, onClose, onDelete, t])
    
  // Always render something consistent - either the alert dialog or nothing
  // This ensures hooks are called consistently
  if (Platform.OS === "web") {
    return null // Empty fragment on web, we use native alerts
  } else {
    return <DeleteAlert {...props} /> // Component on native platforms
  }
}

export default DeleteAlertWrapper