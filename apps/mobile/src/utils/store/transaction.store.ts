import { StateCreator } from "zustand";

import { Transaction } from "@/types/transaction";

import { RouterSlice } from "./router.store";

export interface TransactionSlice {
  currentTransaction?: Transaction;
  setCurrentTransaction: (tx: Transaction | undefined) => void;
}

export const createTransactionSlice: StateCreator<
  TransactionSlice & RouterSlice,
  [],
  [],
  TransactionSlice
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
