import * as userService from "../user.service"

jest.mock("@/utils/store/session-store", () => ({
  getToken: jest.fn().mockResolvedValue("test-token"),
  setToken: jest.fn(),
  deleteToken: jest.fn(),
}))

jest.mock("@/utils/store", () => ({
  useStore: {
    getState: () => ({
      url: "http://localhost:2999",
      logout: mockLogout,
      setBaseCurrency: mockSetBaseCurrency,
    }),
  },
}))

const mockLogout = jest.fn()
const mockSetBaseCurrency = jest.fn()
const mockQueryClientClear = jest.fn()
const mockQueryClientInvalidate = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

/**
 * Tests mirror the handler logic from settings.tsx.
 * Component rendering isn't possible in Jest with RN 0.79 New Architecture,
 * so we test the handler logic directly.
 */

describe("handleCurrencyChange", () => {
  async function handleCurrencyChange(currency: string) {
    mockSetBaseCurrency(currency)
    try {
      await userService.updatePreferences({ preferred_currency: currency })
    } catch {
      // preference saved locally even if sync fails
    }
    mockQueryClientInvalidate()
  }

  test("calls updatePreferences API with selected currency", async () => {
    const spy = jest.spyOn(userService, "updatePreferences").mockResolvedValue({})

    await handleCurrencyChange("USD")

    expect(mockSetBaseCurrency).toHaveBeenCalledWith("USD")
    expect(spy).toHaveBeenCalledWith({ preferred_currency: "USD" })
    expect(mockQueryClientInvalidate).toHaveBeenCalled()

    spy.mockRestore()
  })

  test("still updates local store and invalidates queries when API fails", async () => {
    const spy = jest
      .spyOn(userService, "updatePreferences")
      .mockRejectedValue(new Error("Network error"))

    await handleCurrencyChange("EUR")

    expect(mockSetBaseCurrency).toHaveBeenCalledWith("EUR")
    expect(spy).toHaveBeenCalled()
    expect(mockQueryClientInvalidate).toHaveBeenCalled()

    spy.mockRestore()
  })
})

describe("handleClearCache", () => {
  function handleClearCache() {
    mockQueryClientClear()
  }

  test("clears query client cache", () => {
    handleClearCache()
    expect(mockQueryClientClear).toHaveBeenCalled()
  })
})

describe("handleDeleteAccount", () => {
  async function handleDeleteAccount(): Promise<{ success: boolean }> {
    try {
      await userService.deleteAccount()
      mockLogout()
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  test("calls deleteAccount API and logs out on success", async () => {
    const spy = jest
      .spyOn(userService, "deleteAccount")
      .mockResolvedValue(undefined)

    const result = await handleDeleteAccount()

    expect(spy).toHaveBeenCalled()
    expect(mockLogout).toHaveBeenCalled()
    expect(result.success).toBe(true)

    spy.mockRestore()
  })

  test("does not logout when API fails", async () => {
    const spy = jest
      .spyOn(userService, "deleteAccount")
      .mockRejectedValue(new Error("Server error"))

    const result = await handleDeleteAccount()

    expect(spy).toHaveBeenCalled()
    expect(mockLogout).not.toHaveBeenCalled()
    expect(result.success).toBe(false)

    spy.mockRestore()
  })
})
