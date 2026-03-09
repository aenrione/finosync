import React from "react"
import { TouchableOpacity, View } from "react-native"

import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"

type TagChipProps = {
  name: string
  color?: string
  selected?: boolean
  onPress?: () => void
  onRemove?: () => void
  size?: "sm" | "default"
}

export function TagChip({ name, color, selected, onPress, onRemove, size = "default" }: TagChipProps) {
  const isSmall = size === "sm"

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !onRemove}
      activeOpacity={0.7}
      className={`flex-row items-center rounded-full border ${
        selected ? "border-primary bg-primary/10" : "border-border bg-muted"
      } ${isSmall ? "px-2 py-0.5" : "px-3 py-1.5"}`}
    >
      {color && (
        <View
          className={`rounded-full ${isSmall ? "h-2 w-2 mr-1" : "h-3 w-3 mr-1.5"}`}
          style={{ backgroundColor: color }}
        />
      )}
      <Text className={`${isSmall ? "text-xs" : "text-sm"} ${selected ? "text-primary font-medium" : "text-foreground"}`}>
        {name}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} className="ml-1">
          <Icon name="X" size={isSmall ? 12 : 14} className="text-muted-foreground" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}
