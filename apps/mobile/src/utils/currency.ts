export const PRIMARY = "#3653fe"
export const PRIMARY_LIGHT = "#00aeff"
export const SECONDARY = "#B3B3B3"
export const WHITE = "#FFFFFF"
export const BLACK = "#18191E"
export const LIGHT_BLACK = "#282A37"

export const GRAY_THIN = "#F8F8F8"
export const GRAY_LIGHT = "#D3D3D3"
export const GRAY_MEDIUM = "#B3B3B3"
export const GRAY_DARK = "#81838B"
export const GRAY_DARKER = "#2a2a2a"

// Success
export const SUCCESS = "#60D97D"
export const WARNING = "#ffae00"
export const ALERT = "#cc4b37"
//Format Currencies
export const curStyle = (amount:number | undefined) => {
  if (!amount) { return { color: WHITE, colorClass: "text-white" } }
  const result = amount >= 0 ? { color: SUCCESS, colorClass: "text-success" } : { color: ALERT, colorClass: "text-alert" }
  return result
}


export const showAmount = (amount: string | number | undefined, showInfo = true, symbol: string | undefined = undefined) => {
  if (!amount) return "-"
  const calcAmount = typeof amount === "string" ? amount : amount.toString()
  if (showInfo) return symbol ? symbol + " " + calcAmount : calcAmount
  return "• ".repeat(calcAmount.toString().length)
}

export const amountStyle = (amount: string | number | undefined) => {
  if (!amount) return ""
  let num: number = 0
  if (typeof amount !== "number") {
    num = parseFloat(amount.toString().replace(/[^0-9.-]+/g, ""))
  }  else {
    num = amount
  }
  if (num > 0) return "text-green-400"
  if (num < 0) return "text-red-400"
  return ""
}


