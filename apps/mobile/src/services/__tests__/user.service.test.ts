import { updatePreferences, deleteAccount } from "../user.service"

jest.mock("@/utils/store/session-store", () => ({
  getToken: jest.fn().mockResolvedValue("test-token"),
  setToken: jest.fn(),
  deleteToken: jest.fn(),
}))

jest.mock("@/utils/store", () => {
  const actual = jest.requireActual("@/utils/store")
  return {
    ...actual,
    useStore: {
      ...actual.useStore,
      getState: jest.fn().mockReturnValue({
        url: "http://localhost:2999",
        logout: jest.fn(),
      }),
    },
  }
})

describe("updatePreferences", () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  test("sends PATCH request with preferred_currency", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { attributes: { preferred_currency: "USD" } } }),
    })

    await updatePreferences({ preferred_currency: "USD" })

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/user/preferences",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        }),
        body: JSON.stringify({ preferred_currency: "USD" }),
      }),
    )
  })

  test("throws when response is not ok", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: "Invalid" }),
    })

    await expect(updatePreferences({ preferred_currency: "INVALID" })).rejects.toThrow(
      "Failed to update preferences",
    )
  })
})

describe("deleteAccount", () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  test("sends DELETE request to /user", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 204,
    })

    await deleteAccount()

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/user",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    )
  })

  test("throws when response is not ok", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" }),
    })

    await expect(deleteAccount()).rejects.toThrow("Failed to delete account")
  })
})
