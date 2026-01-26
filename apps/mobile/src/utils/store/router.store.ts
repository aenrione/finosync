import { Router, RelativePathString } from "expo-router"
import { StateCreator } from "zustand"

export interface RouterSlice {
  router: Router | null
  setRouter: (router: Router) => void
  navigate: (path: RelativePathString) => void
}

export const createRouterSlice: StateCreator<RouterSlice> = (set, get) => ({
  router: null,
  setRouter: (router) => set(() => ({ router })),
  navigate: (path) => {
    const { router } = get()
    if (!router) {
      console.warn("Router is not initialized.")
      return
    }
    router.push(path)
  }
})

