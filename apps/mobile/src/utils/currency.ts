/**
 * Currency formatting and amount styling utilities.
 * All color references use design-token Tailwind classes.
 */

export const currencyMetadata: Record<
  string,
  { symbol: string; flag: string; name: string }
> = {
  USD: { symbol: "$", flag: "🇺🇸", name: "US Dollar" },
  EUR: { symbol: "€", flag: "🇪🇺", name: "Euro" },
  GBP: { symbol: "£", flag: "🇬🇧", name: "British Pound" },
  CLP: { symbol: "$", flag: "🇨🇱", name: "Chilean Peso" },
  BRL: { symbol: "R$", flag: "🇧🇷", name: "Brazilian Real" },
  MXN: { symbol: "$", flag: "🇲🇽", name: "Mexican Peso" },
  ARS: { symbol: "$", flag: "🇦🇷", name: "Argentine Peso" },
  PEN: { symbol: "S/", flag: "🇵🇪", name: "Peruvian Sol" },
  COP: { symbol: "$", flag: "🇨🇴", name: "Colombian Peso" },
  UYU: { symbol: "$U", flag: "🇺🇾", name: "Uruguayan Peso" },
  CAD: { symbol: "C$", flag: "🇨🇦", name: "Canadian Dollar" },
  AUD: { symbol: "A$", flag: "🇦🇺", name: "Australian Dollar" },
  JPY: { symbol: "¥", flag: "🇯🇵", name: "Japanese Yen" },
  CHF: { symbol: "CHF", flag: "🇨🇭", name: "Swiss Franc" },
  CNY: { symbol: "¥", flag: "🇨🇳", name: "Chinese Yuan" },
}

export const parseNumericAmount = (
  amount: string | number | undefined | null,
): number | null => {
  if (amount === undefined || amount === null || amount === "") return null
  if (typeof amount === "number")
    return Number.isFinite(amount) ? amount : null

  const sanitized = amount.replace(/\s/g, "").replace(/[^0-9,.-]+/g, "")
  if (!sanitized) return null

  const lastComma = sanitized.lastIndexOf(",")
  const lastDot = sanitized.lastIndexOf(".")
  let normalized = sanitized

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalSeparator = lastComma > lastDot ? "," : "."
    const thousandsSeparator = decimalSeparator === "," ? "." : ","

    normalized = normalized.split(thousandsSeparator).join("")
    if (decimalSeparator === ",") {
      normalized = normalized.replace(",", ".")
    }
  } else if (lastComma !== -1 || lastDot !== -1) {
    const separator = lastComma !== -1 ? "," : "."
    const parts = normalized.split(separator)

    if (parts.length > 2) {
      normalized = parts.join("")
    } else {
      const decimals = parts[1]?.length ?? 0
      if (decimals === 3 || decimals > 3) {
        normalized = parts.join("")
      } else if (separator === ",") {
        normalized = `${parts[0]}.${parts[1] ?? ""}`
      }
    }
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

const formatNumericAmount = (value: number) => new Intl.NumberFormat(undefined, {
  minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  maximumFractionDigits: 2,
}).format(value)

/** Returns a token-based text color class for positive/negative amounts */
export const curStyle = (amount: number | undefined) => {
  if (!amount) {
    return { colorClass: "text-foreground" }
  }

  return amount >= 0
    ? { colorClass: "text-income" }
    : { colorClass: "text-expense" }
}

export const showAmount = (
  amount: string | number | undefined,
  showInfo = true,
  symbol: string | undefined = undefined,
) => {
  if (amount === undefined || amount === null || amount === "") return "-"

  const numeric = parseNumericAmount(amount)
  const displayValue =
    numeric === null ? amount.toString() : formatNumericAmount(numeric)

  if (!showInfo) {
    return "• ".repeat(displayValue.length)
  }

  if (symbol) {
    return `${symbol} ${displayValue}`
  }

  return displayValue
}

/** Returns a token-based text color class for positive/negative amounts */
export const amountStyle = (amount: string | number | undefined) => {
  const numeric = parseNumericAmount(amount)
  if (numeric === null || numeric === 0) return ""
  if (numeric > 0) return "text-income"
  if (numeric < 0) return "text-expense"
  return ""
}

/** Simple currency formatter */
export const formatCurrency = (amount: number, currency?: string) => {
  const absAmount = Math.abs(amount)
  const formatted = formatNumericAmount(absAmount)
  return currency ? `${currency} ${formatted}` : formatted
}

export const getCurrencyMeta = (currency?: string) => {
  if (!currency) return currencyMetadata.USD
  return (
    currencyMetadata[currency] || {
      symbol: currency,
      flag: currency.slice(0, 2).toUpperCase(),
      name: currency,
    }
  )
}

// ─── Currency input formatting utilities ──────────────────────

export type CurrencyFormat = {
  thousandsSep: string
  decimalSep: string
  maxDecimals: number
}

const currencyFormatOverrides: Record<string, CurrencyFormat> = {
  CLP: { thousandsSep: ".", decimalSep: ",", maxDecimals: 0 },
  JPY: { thousandsSep: ",", decimalSep: ".", maxDecimals: 0 },
  BTC: { thousandsSep: ",", decimalSep: ".", maxDecimals: 8 },
}

/**
 * Resolve formatting rules for a currency code.
 * Checks hardcoded overrides first, then probes Intl.NumberFormat.
 * Uses format() instead of formatToParts() for Hermes compatibility.
 */
export const getCurrencyFormat = (currency: string): CurrencyFormat => {
  const upper = currency.toUpperCase()
  if (currencyFormatOverrides[upper]) return currencyFormatOverrides[upper]

  // Probe Intl to detect separators — format "1234.5" and inspect the string.
  // Hermes (React Native) does not support formatToParts(), so we parse
  // the formatted output directly. "1234.5" → e.g. "1,234.50" or "1.234,50"
  const locale = upper === "EUR" ? "de-DE" : "en-US"
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(1234.5)

  // Pattern: digits + thousandsSep + digits + decimalSep + digits
  // e.g. "1,234.50" or "1.234,50"
  const match = formatted.match(/\d(.)?\d{3}(.)?\d{2}$/)
  const thousandsSep = match?.[1] ?? ","
  const decimalSep = match?.[2] ?? "."

  return { thousandsSep, decimalSep, maxDecimals: 2 }
}

/**
 * Format a raw numeric string (e.g. "1234.56") into locale-formatted
 * display text (e.g. "1,234.56" for USD or "1.234" for CLP).
 */
export const formatMoneyInput = (raw: string, currency: string): string => {
  if (!raw) return ""

  const fmt = getCurrencyFormat(currency)
  const parts = raw.split(".")
  const intPart = parts[0] ?? ""
  const decPart = parts.length > 1 ? parts[1] : undefined

  // Add thousands separators to integer part
  let formattedInt = ""
  const digits = intPart.replace(/^-/, "")
  const isNegative = intPart.startsWith("-")
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) {
      formattedInt += fmt.thousandsSep
    }
    formattedInt += digits[i]
  }
  if (isNegative) formattedInt = "-" + formattedInt

  if (decPart === undefined || fmt.maxDecimals === 0) {
    return formattedInt
  }

  const clampedDec = decPart.slice(0, fmt.maxDecimals)
  return formattedInt + fmt.decimalSep + clampedDec
}

/**
 * Strip formatting back to a raw numeric string (digits + single ".").
 */
export const unformatMoneyInput = (
  formatted: string,
  currency: string,
): string => {
  if (!formatted) return ""

  const fmt = getCurrencyFormat(currency)

  // Remove thousands separators
  let raw = formatted.split(fmt.thousandsSep).join("")

  // Normalize decimal separator to canonical "."
  if (fmt.decimalSep !== ".") {
    raw = raw.replace(fmt.decimalSep, ".")
  }

  return raw
}
