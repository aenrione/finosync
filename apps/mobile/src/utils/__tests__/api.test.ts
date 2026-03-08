import { fetchWithAuth, fetchApi } from "../api"
import { useStore } from "../store"

// Mock session-store
jest.mock("../store/session-store", () => ({
  getToken: jest.fn(async () => "test-token"),
  setToken: jest.fn(),
  deleteToken: jest.fn(),
}))

describe("fetchWithAuth", () => {
  const mockLogout = jest.fn()

  beforeEach(() => {
    // Set up store state
    useStore.setState({
      url: "http://localhost:2999",
      logout: mockLogout,
    } as any)

    // Mock global fetch
    global.fetch = jest.fn()
  })

  test("given a relative path, prepends base url from store", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      ok: true,
    })

    await fetchWithAuth("/accounts")

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/accounts",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    )
  })

  test("given init headers, merges with auth header", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      ok: true,
    })

    await fetchWithAuth("/accounts", {
      headers: { "Content-Type": "application/json" },
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/accounts",
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      })
    )
  })

  test("given 401 response, calls logout and throws", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 401,
      ok: false,
    })

    await expect(fetchWithAuth("/accounts")).rejects.toThrow("Unauthorized")
    expect(mockLogout).toHaveBeenCalled()
  })

  test("given successful response, returns the response", async () => {
    const mockResponse = { status: 200, ok: true, json: jest.fn() }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const result = await fetchWithAuth("/accounts")

    expect(result).toBe(mockResponse)
  })

  test("given POST method, passes through to fetch", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ status: 200, ok: true })

    await fetchWithAuth("/accounts", {
      method: "POST",
      body: JSON.stringify({ name: "test" }),
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/accounts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "test" }),
      })
    )
  })
})

describe("fetchApi", () => {
  beforeEach(() => {
    useStore.setState({ url: "http://localhost:2999" } as any)
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
  })

  test("given a relative path, prepends base url from store", async () => {
    await fetchApi("/session")

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/session",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    )
  })

  test("given custom headers, merges with Content-Type", async () => {
    await fetchApi("/session", {
      headers: { "X-Custom": "value" },
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/session",
      expect.objectContaining({
        headers: {
          "X-Custom": "value",
          "Content-Type": "application/json",
        },
      })
    )
  })

  test("does not include Authorization header", async () => {
    await fetchApi("/session")

    const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers
    expect(callHeaders).not.toHaveProperty("Authorization")
  })
})
