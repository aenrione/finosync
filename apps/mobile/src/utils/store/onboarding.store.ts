import { StateCreator } from "zustand"

export interface OnboardingData {
  preferredCurrency: string | null
  financialGoals: string[]
  monthlyIncome: number | null
}

export interface OnboardingSlice {
  onboardingData: OnboardingData
  setOnboardingCurrency: (code: string) => void
  setOnboardingGoals: (goals: string[]) => void
  setOnboardingIncome: (income: number | null) => void
  resetOnboarding: () => void
}

const initialOnboardingData: OnboardingData = {
  preferredCurrency: null,
  financialGoals: [],
  monthlyIncome: null,
}

export const createOnboardingSlice: StateCreator<OnboardingSlice> = (set) => ({
  onboardingData: { ...initialOnboardingData },
  setOnboardingCurrency: (code) => {
    set((state) => ({
      onboardingData: { ...state.onboardingData, preferredCurrency: code },
    }))
  },
  setOnboardingGoals: (goals) => {
    set((state) => ({
      onboardingData: { ...state.onboardingData, financialGoals: goals },
    }))
  },
  setOnboardingIncome: (income) => {
    set((state) => ({
      onboardingData: { ...state.onboardingData, monthlyIncome: income },
    }))
  },
  resetOnboarding: () => {
    set({ onboardingData: { ...initialOnboardingData } })
  },
})
