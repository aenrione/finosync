import type { LucideIcon } from "lucide-react-native"

import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  Animated,
} from "react-native"
import { ChevronDown, Check } from "lucide-react-native"
import * as React from "react"

import { colors } from "@/lib/colors"
import { cn } from "@/lib/utils"

// ─── FormSelect ──────────────────────────────────────────────
// A polished select/picker with bottom sheet modal, matching
// the FormField aesthetic. Replaces raw @react-native-picker.

interface SelectOption {
  value: string | number | null;
  label: string;
  icon?: LucideIcon;
}

interface FormSelectProps {
  label: string;
  options: SelectOption[];
  value: string | number | null;
  onValueChange: (value: string | number | null) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  icon?: LucideIcon;
  containerClassName?: string;
  disabled?: boolean;
}

function FormSelect({
  label,
  options,
  value,
  onValueChange,
  placeholder,
  error,
  helperText,
  required,
  icon: LeadingIcon,
  containerClassName,
  disabled,
}: FormSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const slideAnim = React.useRef(new Animated.Value(0)).current

  const selectedOption = options.find((opt) => opt.value === value)
  const displayText = selectedOption?.label || placeholder || `Select ${label}`
  const hasValue = !!selectedOption

  const openSheet = () => {
    if (disabled) return
    setIsOpen(true)
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start()
  }

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsOpen(false))
  }

  const handleSelect = (optionValue: string | number | null) => {
    onValueChange(optionValue)
    closeSheet()
  }

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  })

  return (
    <View className={cn("mb-5", containerClassName)}>
      {/* Label */}
      <View className="flex-row items-center mb-2">
        <Text
          className={cn(
            "text-sm font-medium",
            error ? "text-error" : "text-muted-foreground",
          )}
        >
          {label}
        </Text>
        {required && (
          <Text className="text-error ml-0.5 text-sm">*</Text>
        )}
      </View>

      {/* Trigger */}
      <Pressable
        onPress={openSheet}
        className={cn(
          "flex-row items-center rounded-lg bg-surface border-[1.5px] overflow-hidden",
          error ? "border-error" : "border-border",
          disabled && "opacity-50",
        )}
      >
        {LeadingIcon && (
          <View className="pl-3.5">
            <LeadingIcon size={18} color={colors.mutedForeground} />
          </View>
        )}

        <Text
          className={cn(
            "flex-1 px-3.5 py-3.5 text-base",
            hasValue ? "text-foreground" : "text-muted-foreground",
            LeadingIcon && "pl-2.5",
          )}
          numberOfLines={1}
        >
          {displayText}
        </Text>

        <View className="pr-3.5">
          <ChevronDown size={18} color={colors.mutedForeground} />
        </View>
      </Pressable>

      {/* Error / helper text */}
      {error ? (
        <Text className="text-error text-xs mt-1.5 ml-0.5">{error}</Text>
      ) : helperText ? (
        <Text className="text-muted-foreground text-xs mt-1.5 ml-0.5">
          {helperText}
        </Text>
      ) : null}

      {/* Bottom Sheet Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
      >
        <View className="flex-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <Pressable
            className="flex-1"
            onPress={closeSheet}
          />
          <Animated.View
            style={{
              transform: [{ translateY }],
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "60%",
              paddingBottom: 32,
            }}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>

            {/* Header */}
            <View className="px-5 py-3 border-b border-border">
              <Text className="text-lg font-semibold text-foreground">
                {label}
              </Text>
            </View>

            {/* Options */}
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const isSelected = item.value === value
                const OptionIcon = item.icon
                return (
                  <Pressable
                    onPress={() => handleSelect(item.value)}
                    className={cn(
                      "flex-row items-center px-5 py-3.5",
                      isSelected && "bg-primary-light",
                    )}
                  >
                    {OptionIcon && (
                      <View className="mr-3">
                        <OptionIcon
                          size={18}
                          color={
                            isSelected
                              ? colors.primary
                              : colors.mutedForeground
                          }
                        />
                      </View>
                    )}
                    <Text
                      className={cn(
                        "flex-1 text-base",
                        isSelected
                          ? "text-primary font-semibold"
                          : "text-foreground",
                      )}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Check size={18} color={colors.primary} />
                    )}
                  </Pressable>
                )
              }}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

export { FormSelect }
export type { FormSelectProps, SelectOption }
