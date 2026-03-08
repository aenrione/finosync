import { StateCreator } from "zustand"

export interface ConfigSlice {
  url: string
  setUrl: (url: string) => void
}

export const createConfigSlice: StateCreator<ConfigSlice> = (set, get) => ({
  url: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  setUrl: (url) => {
    set({ url })
  }
})


