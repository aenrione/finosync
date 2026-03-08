import { curStyle, showAmount, amountStyle, SUCCESS, ALERT, WHITE } from "../currency"

describe("curStyle", () => {
  test("given undefined amount, returns white color", () => {
    const result = curStyle(undefined)
    expect(result).toEqual({ color: WHITE, colorClass: "text-white" })
  })

  test("given zero amount, returns white color (falsy)", () => {
    const result = curStyle(0)
    expect(result).toEqual({ color: WHITE, colorClass: "text-white" })
  })

  test("given positive amount, returns success color", () => {
    const result = curStyle(100)
    expect(result).toEqual({ color: SUCCESS, colorClass: "text-success" })
  })

  test("given negative amount, returns alert color", () => {
    const result = curStyle(-50)
    expect(result).toEqual({ color: ALERT, colorClass: "text-alert" })
  })
})

describe("showAmount", () => {
  test("given undefined amount, returns dash", () => {
    expect(showAmount(undefined)).toBe("-")
  })

  test("given zero as number, returns dash (falsy)", () => {
    expect(showAmount(0)).toBe("-")
  })

  test("given empty string, returns dash", () => {
    expect(showAmount("")).toBe("-")
  })

  test("given number amount with showInfo true, returns string representation", () => {
    expect(showAmount(1500)).toBe("1500")
  })

  test("given string amount with showInfo true, returns the string", () => {
    expect(showAmount("1500")).toBe("1500")
  })

  test("given amount with symbol, returns symbol prefixed", () => {
    expect(showAmount(1500, true, "$")).toBe("$ 1500")
  })

  test("given string amount with symbol, returns symbol prefixed", () => {
    expect(showAmount("1500", true, "CLP")).toBe("CLP 1500")
  })

  test("given amount with showInfo false, returns dots", () => {
    const result = showAmount(1500, false)
    // "1500" has 4 chars, so "• " repeated 4 times
    expect(result).toBe("• • • • ")
  })

  test("given string amount with showInfo false, returns dots", () => {
    const result = showAmount("99", false)
    expect(result).toBe("• • ")
  })
})

describe("amountStyle", () => {
  test("given undefined amount, returns empty string", () => {
    expect(amountStyle(undefined)).toBe("")
  })

  test("given positive number, returns green class", () => {
    expect(amountStyle(100)).toBe("text-green-400")
  })

  test("given negative number, returns red class", () => {
    expect(amountStyle(-100)).toBe("text-red-400")
  })

  test("given zero number, returns empty string", () => {
    expect(amountStyle(0)).toBe("")
  })

  test("given positive string amount, returns green class", () => {
    expect(amountStyle("150.50")).toBe("text-green-400")
  })

  test("given negative string amount, returns red class", () => {
    expect(amountStyle("-75.25")).toBe("text-red-400")
  })

  test("given string with currency symbols, parses number correctly", () => {
    expect(amountStyle("$1,500.00")).toBe("text-green-400")
    expect(amountStyle("-$500.00")).toBe("text-red-400")
  })

  test("given zero as string, returns empty string", () => {
    expect(amountStyle("0")).toBe("")
  })
})
