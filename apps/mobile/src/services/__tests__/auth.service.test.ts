import { login, checkSession } from "../auth.service"
import { useStore } from "@/utils/store"

jest.mock("@/utils/store/session-store", () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  deleteToken: jest.fn(),
}))

jest.mock("@/utils/api", () => ({
  markLoginTimestamp: jest.fn(),
}))

const { getToken, setToken } = require("@/utils/store/session-store")

// Build a fetch mock that returns different bodies based on the request URL.
const fetchByUrl = (mapping: Record<string, any>) =>
  jest.fn(async (url: string) => {
    const key = Object.keys(mapping).find((k) => url.endsWith(k))
    if (!key) throw new Error(`Unexpected fetch URL: ${url}`)
    return mapping[key]
  })

describe("login", () => {
  const mockSetUser = jest.fn()
  const mockSetBaseCurrency = jest.fn()
  const mockRouter = { push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }

  beforeEach(() => {
    useStore.setState({
      url: "http://localhost:2999",
      setUser: mockSetUser,
      setBaseCurrency: mockSetBaseCurrency,
      router: mockRouter as any,
    } as any)
  })

  test("given valid credentials, stores token, sets user, and navigates to dashboard", async () => {
    const mockUser = { id: 1, name: "Test User", onboarding_completed: true }
    // After login stores the token, checkSession reads it back via getToken.
    getToken.mockResolvedValue("new-token")
    global.fetch = fetchByUrl({
      "/session": { ok: true, json: async () => ({ token: "new-token" }) },
      "/user": { ok: true, json: async () => mockUser },
    }) as any

    const result = await login("test@email.com", "password123")

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/session",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_address: "test@email.com", password: "password123" }),
      })
    )
    expect(setToken).toHaveBeenCalledWith("new-token")
    expect(mockSetUser).toHaveBeenCalledWith(mockUser)
    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/(drawer)/(tabs)/dashboard")
    expect(result).toEqual({ success: true })
  })

  test("given a user who hasn't completed onboarding, redirects to welcome", async () => {
    const mockUser = { id: 1, name: "Newbie", onboarding_completed: false }
    getToken.mockResolvedValue("new-token")
    global.fetch = fetchByUrl({
      "/session": { ok: true, json: async () => ({ token: "new-token" }) },
      "/user": { ok: true, json: async () => mockUser },
    }) as any

    await login("test@email.com", "password123")

    expect(mockRouter.replace).toHaveBeenCalledWith("/(app)/(onboarding)/welcome")
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  test("given invalid credentials (non-ok response), returns failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid" }),
    }) as any

    const result = await login("bad@email.com", "wrong")

    expect(result.success).toBe(false)
    expect(result.error).toBe("Login failed")
    expect(setToken).not.toHaveBeenCalled()
  })

  test("given network error, returns failure with error message", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error")) as any

    const result = await login("test@email.com", "password")

    expect(result.success).toBe(false)
    expect(result.error).toBe("Network error")
  })
})

describe("checkSession", () => {
  const mockSetUser = jest.fn()
  const mockSetBaseCurrency = jest.fn()

  beforeEach(() => {
    useStore.setState({
      url: "http://localhost:2999",
      setUser: mockSetUser,
      setBaseCurrency: mockSetBaseCurrency,
    } as any)
    global.fetch = jest.fn() as any
  })

  test("given no stored token, returns null without making API call", async () => {
    getToken.mockResolvedValue(null)

    const result = await checkSession()

    expect(result).toBeNull()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test("given valid token, fetches user and sets in store", async () => {
    const mockUser = { id: 1, name: "Test User" }
    getToken.mockResolvedValue("valid-token")
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    })

    const result = await checkSession()

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/user",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer valid-token" },
      })
    )
    expect(mockSetUser).toHaveBeenCalledWith(mockUser)
    expect(result).toEqual(mockUser)
  })

  test("given user with preferred_currency, syncs to baseCurrency", async () => {
    const mockUser = { id: 1, name: "Test User", preferred_currency: "USD" }
    getToken.mockResolvedValue("valid-token")
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    })

    await checkSession()

    expect(mockSetBaseCurrency).toHaveBeenCalledWith("USD")
  })

  test("given user without preferred_currency, does not change baseCurrency", async () => {
    const mockUser = { id: 1, name: "Test User" }
    getToken.mockResolvedValue("valid-token")
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    })

    await checkSession()

    expect(mockSetBaseCurrency).not.toHaveBeenCalled()
  })

  test("given expired token (non-ok response), returns null", async () => {
    getToken.mockResolvedValue("expired-token")
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    })

    const result = await checkSession()

    expect(result).toBeNull()
  })

  test("given network failure, returns null", async () => {
    getToken.mockResolvedValue("valid-token")
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"))

    const result = await checkSession()

    expect(result).toBeNull()
  })
})
