import type { LucideIcon } from "lucide-react-native"

import {
  Animated,
  TextInput,
  View,
  Text,
  type TextInputProps,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
  Pressable,
} from "react-native"
import * as React from "react"

import { colors } from "@/lib/colors"
import { cn } from "@/lib/utils"

// ─── FormField ───────────────────────────────────────────────
// A polished input wrapper with animated focus border,
// leading/trailing icon slots, error + helper text.

interface FormFieldProps extends TextInputProps {
  label: string
  error?: string
  helperText?: string
  required?: boolean
  icon?: LucideIcon
  trailingIcon?: LucideIcon
  onTrailingIconPress?: () => void
  containerClassName?: string
  className?: string
}

const FormField = React.forwardRef<
  React.ComponentRef<typeof TextInput>,
  FormFieldProps
>(
  (
    {
      label,
      error,
      helperText,
      required,
      icon: LeadingIcon,
      trailingIcon: TrailingIcon,
      onTrailingIconPress,
      containerClassName,
      className,
      value,
      placeholder,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const borderAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      Animated.timing(borderAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start()
    }, [isFocused, borderAnim])

    const borderColor = borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        error ? colors.error : colors.border,
        error ? colors.error : colors.primary,
      ],
    })

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    const isMultiline = !!props.multiline

    return (
      <View className={cn("mb-5", containerClassName)}>
        {/* Label */}
        <View className="flex-row items-center mb-2">
          <Text
            className={cn(
              "text-sm font-medium",
              error
                ? "text-error"
                : isFocused
                  ? "text-primary"
                  : "text-muted-foreground",
            )}
          >
            {label}
          </Text>
          {required && (
            <Text className="text-error ml-0.5 text-sm">*</Text>
          )}
        </View>

        {/* Input container — inline styles because Animated.View + NativeWind flex-row breaks on web */}
        <Animated.View
          style={{
            borderColor,
            borderWidth: 1.5,
            borderRadius: 12,
            flexDirection: isMultiline ? "column" : "row",
            alignItems: isMultiline ? "flex-start" : "center",
            backgroundColor: isFocused ? "#FFFFFF" : colors.surface,
            overflow: "hidden",
          }}
        >
          {LeadingIcon && (
            <View
              style={{
                paddingLeft: 14,
                paddingTop: isMultiline ? 14 : 0,
              }}
            >
              <LeadingIcon
                size={18}
                color={
                  isFocused ? colors.primary : colors.mutedForeground
                }
              />
            </View>
          )}

          <TextInput
            ref={ref}
            value={value}
            placeholder={placeholder || label}
            placeholderTextColor={colors.mutedForeground}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              flex: 1,
              paddingHorizontal: LeadingIcon ? 10 : 14,
              paddingVertical: 14,
              fontSize: 16,
              color: colors.foreground,
              outlineStyle: "none" as any,
              ...(isMultiline && {
                minHeight: 88,
                paddingTop: 8,
                paddingHorizontal: 14,
                textAlignVertical: "top",
              }),
            }}
            className={className}
            textAlignVertical={isMultiline ? "top" : "center"}
            {...props}
          />

          {TrailingIcon && (
            <Pressable
              onPress={onTrailingIconPress}
              style={{ paddingRight: 14 }}
              hitSlop={8}
            >
              <TrailingIcon
                size={18}
                color={
                  isFocused ? colors.primary : colors.mutedForeground
                }
              />
            </Pressable>
          )}
        </Animated.View>

        {/* Error / helper text */}
        {error ? (
          <Text className="text-error text-xs mt-1.5 ml-0.5">{error}</Text>
        ) : helperText ? (
          <Text className="text-muted-foreground text-xs mt-1.5 ml-0.5">
            {helperText}
          </Text>
        ) : null}
      </View>
    )
  },
)
FormField.displayName = "FormField"

export { FormField }
export type { FormFieldProps }
