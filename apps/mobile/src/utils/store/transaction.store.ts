import { StateCreator } from "zustand";

import { Transaction } from "@/types/transaction";

export interface TransactionSlice {
  currentTransaction?: Transaction;
  setCurrentTransaction: (tx: Transaction | undefined) => void;
}

export const createTransactionSlice: StateCreator<
  TransactionSlice & { router?: any }
> = (set, get) => ({
  currentTransaction: undefined,
  setCurrentTransaction: (transaction) => {
    set({ currentTransaction: transaction });
    const { router } = get();
    if (router) {
      router.push("/(app)/add-transaction");
    }
  },
});
