import {
  amountStyle,
  curStyle,
  parseNumericAmount,
  showAmount,
} from "../currency"

describe("curStyle", () => {
  test("given undefined amount, returns foreground color", () => {
    const result = curStyle(undefined)
    expect(result).toEqual({ colorClass: "text-foreground" })
  })

  test("given zero amount, returns foreground color (falsy)", () => {
    const result = curStyle(0)
    expect(result).toEqual({ colorClass: "text-foreground" })
  })

  test("given positive amount, returns income color", () => {
    const result = curStyle(100)
    expect(result).toEqual({ colorClass: "text-income" })
  })

  test("given negative amount, returns expense color", () => {
    const result = curStyle(-50)
    expect(result).toEqual({ colorClass: "text-expense" })
  })
})

describe("showAmount", () => {
  test("given undefined amount, returns dash", () => {
    expect(showAmount(undefined)).toBe("-")
  })

  test("given empty string, returns dash", () => {
    expect(showAmount("")).toBe("-")
  })

  test("given number amount, returns formatted string", () => {
    expect(showAmount(1500)).toBe("1,500")
  })

  test("given string amount, returns the string", () => {
    expect(showAmount("1500")).toBe("1,500")
  })

  test("given amount with symbol, returns symbol prefixed", () => {
    expect(showAmount(1500, true, "$")).toBe("$ 1,500")
  })

  test("given string amount with symbol, returns symbol prefixed", () => {
    expect(showAmount("1500", true, "CLP")).toBe("CLP 1,500")
  })

  test("given amount with showInfo false, returns dots", () => {
    const result = showAmount(1500, false)
    expect(result).toMatch(/^(• )+$/)
  })
})

describe("parseNumericAmount", () => {
  test("parses currency strings with comma thousands", () => {
    expect(parseNumericAmount("$4,200,000")).toBe(4200000)
  })

  test("parses currency strings with dot thousands", () => {
    expect(parseNumericAmount("$4.200.000")).toBe(4200000)
  })

  test("parses locale decimal values", () => {
    expect(parseNumericAmount("CLP 4.200.000,50")).toBe(4200000.5)
  })
})

describe("amountStyle", () => {
  test("given undefined amount, returns empty string", () => {
    expect(amountStyle(undefined)).toBe("")
  })

  test("given positive number, returns income class", () => {
    expect(amountStyle(100)).toBe("text-income")
  })

  test("given negative number, returns expense class", () => {
    expect(amountStyle(-100)).toBe("text-expense")
  })

  test("given zero number, returns empty string", () => {
    expect(amountStyle(0)).toBe("")
  })

  test("given positive string amount, returns income class", () => {
    expect(amountStyle("150.50")).toBe("text-income")
  })

  test("given negative string amount, returns expense class", () => {
    expect(amountStyle("-75.25")).toBe("text-expense")
  })

  test("given zero as string, returns empty string", () => {
    expect(amountStyle("0")).toBe("")
  })
})
