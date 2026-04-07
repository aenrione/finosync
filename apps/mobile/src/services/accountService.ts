import { Account, AccountFormData } from "@/types/account"
import { ensureOk, fetchJsonWithAuth, fetchWithAuth } from "@/utils/api"

export const accountService = {
  async createAccount(data: AccountFormData): Promise<Account> {
    const requestData = { ...data }

    if (data.account_type === "local") {
      delete requestData.primary_key
      delete requestData.secret
    }

    return fetchJsonWithAuth<Account>("/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    })
  },

  async updateAccount(id: string | number, data: Partial<AccountFormData>): Promise<Account> {
    return fetchJsonWithAuth<Account>(`/accounts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  async deleteAccount(id: string | number): Promise<void> {
    await ensureOk(await fetchWithAuth(`/accounts/${id}`, { method: "DELETE" }))
  },

  async fintualInitiateLogin(email: string, password: string): Promise<void> {
    await ensureOk(
      await fetchWithAuth("/fintual/initiate_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
    )
  },

  async fintualFinalizeLogin(
    email: string,
    password: string,
    code: string,
    accountName: string
  ): Promise<Account> {
    return fetchJsonWithAuth<Account>("/fintual/finalize_login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code, account_name: accountName }),
    })
  },

  async syncAccount(id: string | number): Promise<void> {
    await ensureOk(await fetchWithAuth(`/accounts/${id}/sync`, { method: "POST" }))
  },
}
