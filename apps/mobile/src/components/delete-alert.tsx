import { useTranslation } from "@/components/_texts/delete-alert.text"
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
import { Text } from "@/components/ui/text"
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
    
  const text = useTranslation()

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading className="text-foreground font-semibold text-lg">
            {title || text.confirmTitle}
          </Heading>
        </AlertDialogHeader>
        <AlertDialogBody className="mt-3 mb-4">
          <Text className="text-sm">
            {errorMessage || text.confirmMessage}
          </Text>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button
            variant="outline"
            size="sm"
            onPress={onClose}
            className="mr-3"
          >
            <ButtonText>{text.cancel}</ButtonText>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onPress={() => { onDelete(); onClose() }}
          >
            <ButtonText>{text.delete}</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Platform-specific alert implementation
const platformAlert = Platform.OS === "web"
  ? alertPolyfill
  : (title: string, description: string | undefined, options: AlertOption[]) => Alert.alert(title, description, options)

const DeleteAlertWrapper = (props: DeleteAlertProps) => {
  const { isOpen, onClose, onDelete, errorMessage, title } = props
  const text = useTranslation()

  // For web platform, use the polyfill directly in useEffect
  React.useEffect(() => {
    if (Platform.OS === "web" && isOpen) {
      console.log("Web platform detected, showing alert dialog")
      try {
        platformAlert(
          title || text.confirmTitle,
          errorMessage || text.confirmMessage,
          [
            { text: text.cancel, style: "cancel", onPress: () => {
              console.log("Cancel pressed")
              onClose()
            }},
            { text: text.delete, style: "destructive", onPress: () => {
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
  }, [isOpen, title, errorMessage, onClose, onDelete, text])
    
  // Always render something consistent - either the alert dialog or nothing
  // This ensures hooks are called consistently
  if (Platform.OS === "web") {
    return null // Empty fragment on web, we use native alerts
  } else {
    return <DeleteAlert {...props} /> // Component on native platforms
  }
}

export default DeleteAlertWrapper