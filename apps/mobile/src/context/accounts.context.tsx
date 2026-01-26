"use client"
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react"

import { fetchWithAuth } from "@/utils/api"
import { Account } from "@/types/account"

type AccountsContextType = {
  accountsData: Account[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  createAccount: (account: Partial<Account>) => Promise<void>
  deleteAccount: (accountId: string) => Promise<void>
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined)

export function AccountsProvider({ children }:{ children: React.ReactNode }) {
  const [accountsData, setAccountsData] = useState<Account[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccountss = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth("/accounts")
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Unknown error")

      setAccountsData(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching accounts:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const createAccount = useCallback(async (account: Partial<Account>) => {
    try {
      setLoading(true)
      const res = await fetchWithAuth("/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create account")
      await fetchAccountss()
    } catch (err) {
      console.error("Error creating account:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [fetchAccountss])

  const deleteAccount = useCallback(async (accountId: string) => {
    try {
      setLoading(true)
      const res = await fetchWithAuth(`/accounts/${accountId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete account")
      await fetchAccountss()
    } catch (err) {
      console.error("Error deleting account:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [fetchAccountss])

  useEffect(() => {
    fetchAccountss()
  }, [fetchAccountss])

  const contextValue = useMemo(
    () => ({
      accountsData,
      loading,
      error,
      refreshData: fetchAccountss,
      createAccount,
      deleteAccount,
    }),
    [accountsData, loading, error, fetchAccountss, createAccount, deleteAccount]
  )

  return (
    <AccountsContext.Provider value={contextValue}>
      {children}
    </AccountsContext.Provider>
  )
}

export function useAccounts(): AccountsContextType {
  const context = useContext(AccountsContext)
  if (context === undefined) {
    throw new Error("useAccounts must be used within a AccountsProvider")
  }
  return context
}
