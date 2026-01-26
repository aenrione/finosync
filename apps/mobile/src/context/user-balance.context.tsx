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
import { UserBalance } from "@/types/user"

type balancesContextType = {
  balancesData: UserBalance[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

const BalancesContext = createContext<balancesContextType | undefined>(undefined)


export function BalancesProvider({ children }:{ children: React.ReactNode }) {
  const [balancesData, setAccountsData] = useState<UserBalance[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserBalance = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth("/user/balances")
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Unknown error")

      setAccountsData(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching accounts:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserBalance()
  }, [fetchUserBalance])

  const contextValue = useMemo(
    () => ({
      balancesData,
      loading,
      error,
      refreshData: fetchUserBalance,
    }),
    [balancesData, loading, error, fetchUserBalance]
  )

  return (
    <BalancesContext.Provider value={contextValue}>
      {children}
    </BalancesContext.Provider>
  )
}


export function useBalances(): balancesContextType {
  const context = useContext(BalancesContext)
  if (context === undefined) {
    throw new Error("useBalances must be used within a BalancesProvider")
  }
  return context
}


