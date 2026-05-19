import { accountService } from "../accountService"
import { fetchWithAuth, fetchJsonWithAuth, ensureOk } from "@/utils/api"
import { AccountFormData } from "@/types/account"

jest.mock("@/utils/api", () => ({
  fetchWithAuth: jest.fn(),
  fetchJsonWithAuth: jest.fn(),
  ensureOk: jest.fn(async (r: any) => r),
}))

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>
const mockFetchJsonWithAuth = fetchJsonWithAuth as jest.MockedFunction<
  typeof fetchJsonWithAuth
>
const mockEnsureOk = ensureOk as jest.MockedFunction<typeof ensureOk>

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
      mockFetchJsonWithAuth.mockResolvedValue(mockAccount as any)

      await accountService.createAccount(localAccountData)

      const [url, init] = mockFetchJsonWithAuth.mock.calls[0]
      expect(url).toBe("/accounts")
      expect((init as any).method).toBe("POST")
      const callBody = JSON.parse((init as any).body)
      expect(callBody).not.toHaveProperty("primary_key")
      expect(callBody).not.toHaveProperty("secret")
      expect(callBody.account_name).toBe("Savings")
      expect(callBody.account_type).toBe("local")
    })

    test("given non-local account, keeps primary_key in request", async () => {
      mockFetchJsonWithAuth.mockResolvedValue({
        id: "2",
        ...fintocAccountData,
        code: "CLP",
      } as any)

      await accountService.createAccount(fintocAccountData)

      const callBody = JSON.parse((mockFetchJsonWithAuth.mock.calls[0][1] as any).body)
      expect(callBody.primary_key).toBe("pk_test_123")
    })

    test("given successful response, returns the created account", async () => {
      const mockAccount = { id: "1", account_name: "Savings", account_type: "local", code: "USD" }
      mockFetchJsonWithAuth.mockResolvedValue(mockAccount as any)

      const result = await accountService.createAccount(localAccountData)

      expect(result).toEqual(mockAccount)
    })

    test("given error response, propagates the underlying error", async () => {
      mockFetchJsonWithAuth.mockRejectedValue(new Error("Account name already exists"))

      await expect(accountService.createAccount(localAccountData)).rejects.toThrow(
        "Account name already exists"
      )
    })
  })

  describe("updateAccount", () => {
    test("given valid id and data, sends PUT request", async () => {
      const mockAccount = { id: "1", account_name: "Updated", account_type: "local", code: "USD" }
      mockFetchJsonWithAuth.mockResolvedValue(mockAccount as any)

      const result = await accountService.updateAccount("1", { account_name: "Updated" })

      expect(mockFetchJsonWithAuth).toHaveBeenCalledWith(
        "/accounts/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ account_name: "Updated" }),
        })
      )
      expect(result).toEqual(mockAccount)
    })

    test("given error response, propagates the underlying error", async () => {
      mockFetchJsonWithAuth.mockRejectedValue(new Error("Not found"))

      await expect(accountService.updateAccount("999", {})).rejects.toThrow("Not found")
    })
  })

  describe("deleteAccount", () => {
    test("given valid id, sends DELETE request and asserts the response is ok", async () => {
      const fakeResponse = { ok: true } as any
      mockFetchWithAuth.mockResolvedValue(fakeResponse)

      await accountService.deleteAccount("1")

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        "/accounts/1",
        expect.objectContaining({ method: "DELETE" })
      )
      expect(mockEnsureOk).toHaveBeenCalledWith(fakeResponse)
    })

    test("given a non-ok response, surfaces ensureOk's error", async () => {
      mockFetchWithAuth.mockResolvedValue({ ok: false } as any)
      mockEnsureOk.mockRejectedValueOnce(new Error("Cannot delete"))

      await expect(accountService.deleteAccount("1")).rejects.toThrow("Cannot delete")
    })

    test("given numeric id, includes id in path", async () => {
      mockFetchWithAuth.mockResolvedValue({ ok: true } as any)

      await accountService.deleteAccount(42)

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/accounts/42", expect.anything())
    })
  })
})
