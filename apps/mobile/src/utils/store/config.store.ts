import { StateCreator } from "zustand"

export interface ConfigSlice {
  url: string
  setUrl: (url: string) => void
}

export const createConfigSlice: StateCreator<ConfigSlice> = (set, get) => ({
  url: "http://localhost:2999", // TODO: Make this configurable with env
  setUrl: (url) => {
    set({ url })
  }
})


