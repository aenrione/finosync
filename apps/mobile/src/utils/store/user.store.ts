import { StateCreator } from "zustand"

import { User } from "@/types/user"

import { deleteToken } from "./session-store"

export interface UserSlice {
  user: User | null
  isVisible: boolean
  setUser: (user: User) => void
  toggleVisibility: () => void
  logout: () => void
}

export const createUserSlice: StateCreator<UserSlice & { router: any }> = (set, get) => ({
  user: null,
  isVisible: true,
  setUser: (user) =>  set({ user }),
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
  logout: () => {
    set({ user: null })
    deleteToken()
    const { router } = get()
    router?.push("/(auth)/sign-in")
  }
})

