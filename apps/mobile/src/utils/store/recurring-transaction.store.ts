import { StateCreator } from "zustand"

import { RecurringTransaction } from "@/types/recurring-transaction"

export interface RecurringTransactionSlice {
  currentRecurringTransaction?: RecurringTransaction
  setCurrentRecurringTransaction: (rt?: RecurringTransaction) => void
}

export const createRecurringTransactionSlice: StateCreator<
  RecurringTransactionSlice & { router: any }
> = (set, get) => ({
  currentRecurringTransaction: undefined,
  setCurrentRecurringTransaction: (rt) => {
    set({ currentRecurringTransaction: rt })
    const { router } = get()
    if (router && rt) {
      router.push(`/recurring/${rt.id}`)
    }
  },
})
