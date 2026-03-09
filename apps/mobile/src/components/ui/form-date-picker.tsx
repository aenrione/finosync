import { Pressable, Text, View, Platform } from "react-native"
import { Calendar } from "lucide-react-native"
import * as React from "react"

import { colors } from "@/lib/colors"
import { cn } from "@/lib/utils"

// ─── FormDatePicker ──────────────────────────────────────────
// Matches FormField aesthetic. Shows a tappable date display
// that opens the native DateTimePicker on mobile or an HTML
// date input on web.

interface FormDatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  containerClassName?: string;
  placeholder?: string;
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function WebDateInput({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: {
  value: Date
  onChange: (date: Date) => void
  minimumDate?: Date
  maximumDate?: Date
}) {
  return (
    <input
      type="date"
      value={formatDateISO(value)}
      min={minimumDate ? formatDateISO(minimumDate) : undefined}
      max={maximumDate ? formatDateISO(maximumDate) : undefined}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const d = new Date(e.target.value + "T00:00:00")
        if (!isNaN(d.getTime())) onChange(d)
      }}
      style={{
        flex: 1,
        border: "none",
        background: "transparent",
        outline: "none",
        fontSize: 16,
        color: colors.foreground,
        paddingTop: 14,
        paddingBottom: 14,
        paddingLeft: 10,
        paddingRight: 14,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    />
  )
}

function NativeDatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
  showPicker,
  setShowPicker,
}: {
  value: Date
  onChange: (date: Date) => void
  minimumDate?: Date
  maximumDate?: Date
  showPicker: boolean
  setShowPicker: (v: boolean) => void
}) {
  // Lazy-require to avoid web bundling issues
  const DateTimePicker =
    require("@react-native-community/datetimepicker").default

  const handleChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowPicker(false)
    }
    if (selectedDate) {
      onChange(selectedDate)
    }
  }

  const formattedDate = value.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <>
      <Pressable
        onPress={() => setShowPicker(true)}
        className={cn(
          "flex-row items-center rounded-lg bg-surface border-[1.5px] border-border overflow-hidden",
        )}
      >
        <View className="pl-3.5">
          <Calendar size={18} color={colors.mutedForeground} />
        </View>
        <Text className="flex-1 px-2.5 py-3.5 text-base text-foreground">
          {formattedDate}
        </Text>
      </Pressable>

      {showPicker && (
        <View>
          <DateTimePicker
            value={value}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
          {Platform.OS === "ios" && (
            <Pressable
              onPress={() => setShowPicker(false)}
              className="self-end mt-1 px-4 py-2 rounded-lg bg-primary"
            >
              <Text className="text-sm font-semibold text-white">Done</Text>
            </Pressable>
          )}
        </View>
      )}
    </>
  )
}

function FormDatePicker({
  label,
  value,
  onChange,
  error,
  helperText,
  required,
  minimumDate,
  maximumDate,
  containerClassName,
}: FormDatePickerProps) {
  const [showPicker, setShowPicker] = React.useState(false)
  const isWeb = Platform.OS === "web"

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

      {isWeb ? (
        <View
          className={cn(
            "flex-row items-center rounded-lg bg-surface border-[1.5px] overflow-hidden",
            error ? "border-error" : "border-border",
          )}
        >
          <View className="pl-3.5">
            <Calendar size={18} color={colors.mutedForeground} />
          </View>
          <WebDateInput
            value={value}
            onChange={onChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        </View>
      ) : (
        <NativeDatePicker
          value={value}
          onChange={onChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          showPicker={showPicker}
          setShowPicker={setShowPicker}
        />
      )}

      {/* Error / helper */}
      {error ? (
        <Text className="text-error text-xs mt-1.5 ml-0.5">{error}</Text>
      ) : helperText ? (
        <Text className="text-muted-foreground text-xs mt-1.5 ml-0.5">
          {helperText}
        </Text>
      ) : null}
    </View>
  )
}

export { FormDatePicker }
export type { FormDatePickerProps }
