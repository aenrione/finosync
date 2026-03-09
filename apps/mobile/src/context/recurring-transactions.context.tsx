"use client"
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react"

import { RecurringTransaction, RecurringTransactionFormData } from "@/types/recurring-transaction"
import { recurringTransactionService } from "@/services/recurring-transaction.service"

type RecurringTransactionsContextType = {
  recurringTransactions: RecurringTransaction[]
  upcomingTransactions: RecurringTransaction[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  createRecurring: (data: RecurringTransactionFormData) => Promise<RecurringTransaction>
  updateRecurring: (id: number, data: Partial<RecurringTransactionFormData>) => Promise<RecurringTransaction>
  deleteRecurring: (id: number) => Promise<void>
}

const RecurringTransactionsContext = createContext<RecurringTransactionsContextType | undefined>(undefined)

export function RecurringTransactionsProvider({ children }: { children: React.ReactNode }) {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecurring = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await recurringTransactionService.fetchAll()
      setRecurringTransactions(data)
    } catch (err) {
      console.error("Error fetching recurring transactions:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setRecurringTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const upcomingTransactions = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    return recurringTransactions
      .filter((rt) => {
        if (!rt.is_active) return false
        const dueDate = new Date(rt.next_due_date)
        return dueDate <= thirtyDaysFromNow
      })
      .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())
  }, [recurringTransactions])

  const createRecurring = useCallback(async (data: RecurringTransactionFormData) => {
    const result = await recurringTransactionService.create(data)
    await fetchRecurring()
    return result
  }, [fetchRecurring])

  const updateRecurring = useCallback(async (id: number, data: Partial<RecurringTransactionFormData>) => {
    const result = await recurringTransactionService.update(id, data)
    await fetchRecurring()
    return result
  }, [fetchRecurring])

  const deleteRecurring = useCallback(async (id: number) => {
    await recurringTransactionService.delete(id)
    await fetchRecurring()
  }, [fetchRecurring])

  useEffect(() => {
    fetchRecurring()
  }, [fetchRecurring])

  const contextValue = useMemo(
    () => ({
      recurringTransactions,
      upcomingTransactions,
      loading,
      error,
      refreshData: fetchRecurring,
      createRecurring,
      updateRecurring,
      deleteRecurring,
    }),
    [recurringTransactions, upcomingTransactions, loading, error, fetchRecurring, createRecurring, updateRecurring, deleteRecurring]
  )

  return (
    <RecurringTransactionsContext.Provider value={contextValue}>
      {children}
    </RecurringTransactionsContext.Provider>
  )
}

export function useRecurringTransactions(): RecurringTransactionsContextType {
  const context = useContext(RecurringTransactionsContext)
  if (context === undefined) {
    throw new Error("useRecurringTransactions must be used within a RecurringTransactionsProvider")
  }
  return context
}
