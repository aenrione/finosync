import { Pressable, Text, View, Animated } from "react-native"
import * as React from "react"

import { colors } from "@/lib/colors"
import { cn } from "@/lib/utils"

// ─── FormToggle ──────────────────────────────────────────────
// A custom toggle / segmented control for binary choices.
// Two variants:
//   - "switch"  → labeled toggle row (like enable/disable)
//   - "segment" → two-segment pill (like income/expense)

interface FormToggleProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** For "switch" variant */
  title?: string;
  subtitle?: string;
  /** For "segment" variant */
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  variant?: "switch" | "segment";
  containerClassName?: string;
}

function FormToggle({
  label,
  value,
  onValueChange,
  title,
  subtitle,
  leftLabel = "On",
  rightLabel = "Off",
  leftColor,
  rightColor,
  variant = "switch",
  containerClassName,
}: FormToggleProps) {
  const slideAnim = React.useRef(new Animated.Value(value ? 1 : 0)).current

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      tension: 68,
      friction: 12,
    }).start()
  }, [value, slideAnim])

  if (variant === "segment") {
    return (
      <View className={cn("mb-5", containerClassName)}>
        {label && (
          <Text className="text-sm font-medium text-muted-foreground mb-2">
            {label}
          </Text>
        )}
        <View className="flex-row bg-surface rounded-lg border border-border p-1">
          <Pressable
            onPress={() => onValueChange(true)}
            className={cn(
              "flex-1 py-3 rounded-md items-center justify-center",
              value && "bg-white shadow-sm",
            )}
          >
            <Text
              className={cn(
                "text-sm font-semibold",
                value ? "text-foreground" : "text-muted-foreground",
              )}
              style={value && leftColor ? { color: leftColor } : undefined}
            >
              {leftLabel}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onValueChange(false)}
            className={cn(
              "flex-1 py-3 rounded-md items-center justify-center",
              !value && "bg-white shadow-sm",
            )}
          >
            <Text
              className={cn(
                "text-sm font-semibold",
                !value ? "text-foreground" : "text-muted-foreground",
              )}
              style={!value && rightColor ? { color: rightColor } : undefined}
            >
              {rightLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    )
  }

  // Switch variant
  const trackBg = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  })

  const thumbTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  })

  return (
    <View className={cn("mb-5", containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-muted-foreground mb-2">
          {label}
        </Text>
      )}
      <View className="flex-row items-center justify-between rounded-lg bg-surface border border-border p-4">
        <View className="flex-1 mr-4">
          {title && (
            <Text className="text-sm font-medium text-foreground">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className="text-xs text-muted-foreground mt-0.5">
              {subtitle}
            </Text>
          )}
        </View>

        <Pressable onPress={() => onValueChange(!value)}>
          <Animated.View
            style={{
              backgroundColor: trackBg,
              width: 46,
              height: 26,
              borderRadius: 13,
              justifyContent: "center",
            }}
          >
            <Animated.View
              style={{
                transform: [{ translateX: thumbTranslate }],
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  )
}

export { FormToggle }
export type { FormToggleProps }
