import { fetchWithAuth } from "@/utils/api"
import { RecurringTransaction, RecurringTransactionFormData } from "@/types/recurring-transaction"

export const recurringTransactionService = {
  async fetchAll(params?: { active?: boolean; upcoming?: number }): Promise<RecurringTransaction[]> {
    const searchParams = new URLSearchParams()
    if (params?.active) searchParams.set("active", "true")
    if (params?.upcoming) searchParams.set("upcoming", params.upcoming.toString())
    const query = searchParams.toString()
    const res = await fetchWithAuth(`/recurring_transactions${query ? `?${query}` : ""}`)
    if (!res.ok) throw new Error("Failed to fetch recurring transactions")
    return res.json()
  },

  async fetch(id: number): Promise<RecurringTransaction> {
    const res = await fetchWithAuth(`/recurring_transactions/${id}`)
    if (!res.ok) throw new Error("Failed to fetch recurring transaction")
    return res.json()
  },

  async create(data: RecurringTransactionFormData): Promise<RecurringTransaction> {
    const res = await fetchWithAuth("/recurring_transactions", {
      method: "POST",
      body: JSON.stringify({ recurring_transaction: data }),
    })
    if (!res.ok) throw new Error("Failed to create recurring transaction")
    return res.json()
  },

  async update(id: number, data: Partial<RecurringTransactionFormData>): Promise<RecurringTransaction> {
    const res = await fetchWithAuth(`/recurring_transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ recurring_transaction: data }),
    })
    if (!res.ok) throw new Error("Failed to update recurring transaction")
    return res.json()
  },

  async delete(id: number): Promise<void> {
    const res = await fetchWithAuth(`/recurring_transactions/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete recurring transaction")
  },

  async linkTransaction(recurringId: number, transactionId: number): Promise<void> {
    const res = await fetchWithAuth(`/recurring_transactions/${recurringId}/link_transaction`, {
      method: "POST",
      body: JSON.stringify({ transaction_id: transactionId }),
    })
    if (!res.ok) throw new Error("Failed to link transaction")
  },

  async unlinkTransaction(recurringId: number, transactionId: number): Promise<void> {
    const res = await fetchWithAuth(
      `/recurring_transactions/${recurringId}/unlink_transaction/${transactionId}`,
      { method: "DELETE" }
    )
    if (!res.ok) throw new Error("Failed to unlink transaction")
  },
}
