import { TextInput } from "react-native"
import * as React from "react"

import { FormField, type FormFieldProps } from "@/components/ui/form-field"
import {
  getCurrencyFormat,
  formatMoneyInput,
} from "@/utils/currency"
import { useStore } from "@/utils/store"

// ─── MoneyInput ──────────────────────────────────────────────
// Numeric money input that displays locale-formatted text while
// keeping a raw numeric string ("1234.56") as the source of truth.

interface MoneyInputProps
  extends Omit<FormFieldProps, "value" | "onChangeText" | "keyboardType"> {
  /** Raw numeric string, e.g. "1234.56" */
  value: string
  /** Called with the raw numeric string after every change */
  onChangeValue: (raw: string) => void
  /** Override currency (defaults to store baseCurrency) */
  currency?: string
}

const MoneyInput = React.forwardRef<
  React.ComponentRef<typeof TextInput>,
  MoneyInputProps
>(({ value, onChangeValue, currency: currencyProp, ...rest }, forwardedRef) => {
  const baseCurrency = useStore((s) => s.baseCurrency)
  const currency = currencyProp ?? baseCurrency
  const fmt = getCurrencyFormat(currency)

  const innerRef = React.useRef<TextInput | null>(null)

  // Merge forwarded ref + inner ref
  const setRef = React.useCallback(
    (node: TextInput | null) => {
      innerRef.current = node
      if (typeof forwardedRef === "function") forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef],
  )

  const displayValue = formatMoneyInput(value, currency)

  const handleChangeText = (text: string) => {
    // --- 1. Capture cursor position in old formatted text ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input = innerRef.current as Record<string, any> | null
    const oldSelection: number | undefined =
      input?.props?.selection?.start ??
      input?._lastNativeSelection?.start ??
      undefined

    // --- 2. Normalize locale decimal separator to canonical "." ---
    let cleaned = text
    if (fmt.decimalSep !== ".") {
      cleaned = cleaned.split(fmt.decimalSep).join(".")
    }

    // --- 3. Strip thousands separators ---
    cleaned = cleaned.split(fmt.thousandsSep).join("")

    // --- 4. Strip non-numeric except "." and leading "-" ---
    cleaned = cleaned.replace(/[^0-9.]/g, "")

    // --- 5. Allow only one decimal point ---
    const dotIdx = cleaned.indexOf(".")
    if (dotIdx !== -1) {
      cleaned =
        cleaned.slice(0, dotIdx + 1) +
        cleaned.slice(dotIdx + 1).replace(/\./g, "")
    }

    // --- 6. Block decimals for zero-decimal currencies ---
    if (fmt.maxDecimals === 0) {
      cleaned = cleaned.replace(/\./g, "")
    }

    // --- 7. Clamp decimal places ---
    if (fmt.maxDecimals > 0 && cleaned.includes(".")) {
      const [intPart, decPart] = cleaned.split(".")
      cleaned = intPart + "." + (decPart ?? "").slice(0, fmt.maxDecimals)
    }

    // --- 8. Strip leading zeros (but allow "0." and bare "0") ---
    if (cleaned.length > 1 && cleaned.startsWith("0") && cleaned[1] !== ".") {
      cleaned = cleaned.replace(/^0+/, "") || "0"
    }

    const raw = cleaned // canonical raw value

    // --- 9. Cursor repositioning ---
    // Count "significant" characters (digits + decimal) before cursor
    // in old text and map to the same count in new formatted text.
    if (oldSelection !== undefined) {
      const oldText = displayValue
      let sigCount = 0
      for (let i = 0; i < Math.min(oldSelection, oldText.length); i++) {
        const ch = oldText[i]
        if (/[0-9]/.test(ch!) || ch === fmt.decimalSep) sigCount++
      }
      // If user typed a character, adjust sigCount for the insertion
      if (text.length > oldText.length) sigCount++

      const newFormatted = formatMoneyInput(raw, currency)
      let newCursor = 0
      let counted = 0
      for (let i = 0; i < newFormatted.length && counted < sigCount; i++) {
        newCursor = i + 1
        const ch = newFormatted[i]
        if (/[0-9]/.test(ch!) || ch === fmt.decimalSep) counted++
      }

      requestAnimationFrame(() => {
        innerRef.current?.setNativeProps?.({
          selection: { start: newCursor, end: newCursor },
        })
      })
    }

    onChangeValue(raw)
  }

  return (
    <FormField
      ref={setRef}
      value={displayValue}
      onChangeText={handleChangeText}
      keyboardType="numeric"
      {...rest}
    />
  )
})
MoneyInput.displayName = "MoneyInput"

export { MoneyInput }
export type { MoneyInputProps }
