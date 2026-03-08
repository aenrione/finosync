/**
 * Currency formatting and amount styling utilities.
 * All color references use design-token Tailwind classes.
 */

/** Returns a token-based text color class for positive/negative amounts */
export const curStyle = (amount: number | undefined) => {
  if (!amount) { return { colorClass: "text-foreground" } }
  return amount >= 0
    ? { colorClass: "text-income" }
    : { colorClass: "text-expense" }
}

export const showAmount = (amount: string | number | undefined, showInfo = true, symbol: string | undefined = undefined) => {
  if (!amount) return "-"
  const calcAmount = typeof amount === "string" ? amount : amount.toString()
  if (showInfo) return symbol ? symbol + " " + calcAmount : calcAmount
  return "• ".repeat(calcAmount.toString().length)
}

/** Returns a token-based text color class for positive/negative amounts */
export const amountStyle = (amount: string | number | undefined) => {
  if (!amount) return ""
  let num: number = 0
  if (typeof amount !== "number") {
    num = parseFloat(amount.toString().replace(/[^0-9.-]+/g, ""))
  } else {
    num = amount
  }
  if (num > 0) return "text-income"
  if (num < 0) return "text-expense"
  return ""
}

/** Simple currency formatter */
export const formatCurrency = (amount: number, currency?: string) => {
  const absAmount = Math.abs(amount)
  const formatted = absAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return currency ? `${currency} ${formatted}` : formatted
}


