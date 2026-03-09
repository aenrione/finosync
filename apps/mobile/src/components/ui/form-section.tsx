import { Text, View } from "react-native"
import * as React from "react"

import { cn } from "@/lib/utils"

// ─── FormSection ─────────────────────────────────────────────
// Groups related form fields inside a card with optional title
// and description. Creates visual hierarchy in long forms.

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <View
      className={cn(
        "rounded-xl border border-border bg-card p-4 mb-4",
        className,
      )}
    >
      {title && (
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </Text>
      )}
      {description && (
        <Text className="text-sm text-muted-foreground mt-1.5 leading-5">
          {description}
        </Text>
      )}
      {(title || description) && <View className="h-4" />}
      {children}
    </View>
  )
}

export { FormSection }
export type { FormSectionProps }
