import { StateCreator } from "zustand"

import { Account } from "@/types/account"

import { RouterSlice } from "./router.store"

export interface AccountSlice {
  currentAccount?: Account
  setCurrentAccount: (tx: Account) => void
}

export const createAccountSlice: StateCreator<
  AccountSlice & RouterSlice,
  [],
  [],
  AccountSlice
> = (set, get) => ({
  currentAccount: undefined,
  setCurrentAccount: (transaction) => {
    set({ currentAccount: transaction })
    const { router } = get()
    if (router) {
      router.push("/(app)/add-account")
    }
  }
})


