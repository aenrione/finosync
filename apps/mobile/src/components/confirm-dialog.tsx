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
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"

type ConfirmDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  destructive?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} size="md">
      <AlertDialogBackdrop onPress={onClose} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading className="text-foreground font-semibold text-lg">
            {title}
          </Heading>
        </AlertDialogHeader>
        <AlertDialogBody className="mt-3 mb-4">
          <Text className="text-sm text-muted-foreground">{message}</Text>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button variant="outline" size="sm" onPress={onClose} className="mr-3">
            <ButtonText variant="outline">{cancelLabel}</ButtonText>
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            size="sm"
            onPress={() => {
              onConfirm()
              onClose()
            }}
          >
            <ButtonText variant={destructive ? "destructive" : "default"}>
              {confirmLabel}
            </ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
