import { StateCreator } from "zustand"

import { type AppLanguage } from "@/shared/locale/config"

export interface ConfigSlice {
  url: string;
  setUrl: (url: string) => void;
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  transactionAlerts: boolean;
  setTransactionAlerts: (enabled: boolean) => void;
  budgetWarnings: boolean;
  setBudgetWarnings: (enabled: boolean) => void;
}

export const createConfigSlice: StateCreator<ConfigSlice> = (set) => ({
  url: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:2999",
  setUrl: (url) => {
    set({ url })
  },
  baseCurrency: "CLP",
  setBaseCurrency: (currency) => {
    set({ baseCurrency: currency })
  },
  language: "system",
  setLanguage: (language) => {
    set({ language })
  },
  transactionAlerts: true,
  setTransactionAlerts: (enabled) => {
    set({ transactionAlerts: enabled })
  },
  budgetWarnings: true,
  setBudgetWarnings: (enabled) => {
    set({ budgetWarnings: enabled })
  },
})
