import { accountService } from "../accountService"
import { fetchWithAuth } from "@/utils/api"
import { AccountFormData } from "@/types/account"

// Mock fetchWithAuth
jest.mock("@/utils/api", () => ({
  fetchWithAuth: jest.fn(),
}))

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

describe("accountService", () => {
  describe("createAccount", () => {
    const localAccountData: AccountFormData = {
      account_type: "local",
      account_name: "Savings",
      primary_key: "should-be-removed",
      secret: "should-be-removed",
    }

    const fintocAccountData: AccountFormData = {
      account_type: "fintoc",
      account_name: "Bank Account",
      primary_key: "pk_test_123",
    }

    test("given local account, removes primary_key and secret from request", async () => {
      const mockAccount = { id: "1", account_name: "Savings", account_type: "local", code: "USD" }
      mockFetchWithAuth.mockResolvedValue({
        ok: true,
        json: async () => mockAccount,
      } as any)

      await accountService.createAccount(localAccountData)

      const callBody = JSON.parse((mockFetchWithAuth.mock.calls[0][1] as any).body)
      expect(callBody).not.toHaveProperty("primary_key")
      expect(callBody).not.toHaveProperty("secret")
      expect(callBody.account_name).toBe("Savings")
      expect(callBody.account_type).toBe("local")
    })

    test("given non-local account, keeps primary_key in request", async () => {
      mockFetchWithAuth.mockResolvedValue({
        ok: true,
        json: async () => ({ id: "2", ...fintocAccountData, code: "CLP" }),
      } as any)

      await accountService.createAccount(fintocAccountData)

      const callBody = JSON.parse((mockFetchWithAuth.mock.calls[0][1] as any).body)
      expect(callBody.primary_key).toBe("pk_test_123")
    })

    test("given successful response, returns the created account", async () => {
      const mockAccount = { id: "1", account_name: "Savings", account_type: "local", code: "USD" }
      mockFetchWithAuth.mockResolvedValue({
        ok: true,
        json: async () => mockAccount,
      } as any)

      const result = await accountService.createAccount(localAccountData)

      expect(result).toEqual(mockAccount)
    })

    test("given error response, throws with server error message", async () => {
      mockFetchWithAuth.mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Account name already exists" }),
      } as any)

      await expect(accountService.createAccount(localAccountData)).rejects.toThrow(
        "Account name already exists"
      )
    })

    test("given error response without message, throws default message", async () => {
      mockFetchWithAuth.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      } as any)

      await expect(accountService.createAccount(localAccountData)).rejects.toThrow(
        "Failed to create account"
      )
    })
  })

  describe("updateAccount", () => {
    test("given valid id and data, sends PUT request", async () => {
      const mockAccount = { id: "1", account_name: "Updated", account_type: "local", code: "USD" }
      mockFetchWithAuth.mockResolvedValue({
        ok: true,
        json: async () => mockAccount,
      } as any)

      const result = await accountService.updateAccount("1", { account_name: "Updated" })

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        "/accounts/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ account_name: "Updated" }),
        })
      )
      expect(result).toEqual(mockAccount)
    })

    test("given error response, throws with server error message", async () => {
      mockFetchWithAuth.mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Not found" }),
      } as any)

      await expect(accountService.updateAccount("999", {})).rejects.toThrow("Not found")
    })
  })

  describe("deleteAccount", () => {
    test("given valid id, sends DELETE request", async () => {
      mockFetchWithAuth.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as any)

      await accountService.deleteAccount("1")

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        "/accounts/1",
        expect.objectContaining({ method: "DELETE" })
      )
    })

    test("given error response, throws with server error message", async () => {
      mockFetchWithAuth.mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Cannot delete" }),
      } as any)

      await expect(accountService.deleteAccount("1")).rejects.toThrow("Cannot delete")
    })

    test("given numeric id, includes id in path", async () => {
      mockFetchWithAuth.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as any)

      await accountService.deleteAccount(42)

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/accounts/42", expect.anything())
    })
  })
})
