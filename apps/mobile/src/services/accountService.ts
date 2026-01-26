import { Account, AccountFormData } from "@/types/account"
import { fetchWithAuth } from "@/utils/api"

export const accountService = {
  async createAccount(data: AccountFormData): Promise<Account> {
    const requestData = { ...data }
    
    if (data.account_type === "local") {
      delete requestData.primary_key
      delete requestData.secret
    }

    const response = await fetchWithAuth("/accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create account")
    }

    return response.json()
  },

  async updateAccount(id: string | number, data: Partial<AccountFormData>): Promise<Account> {
    const response = await fetchWithAuth(`/accounts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update account")
    }

    return response.json()
  },

  async deleteAccount(id: string | number): Promise<void> {
    const response = await fetchWithAuth(`/accounts/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to delete account")
    }
  },
} 