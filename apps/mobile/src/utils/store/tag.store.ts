import { StateCreator } from "zustand"

import { Tag } from "@/types/tag"

export interface TagSlice {
  currentTag?: Tag
  setCurrentTag: (tag?: Tag) => void
}

export const createTagSlice: StateCreator<TagSlice & { router: any }> = (set, get) => ({
  currentTag: undefined,
  setCurrentTag: (tag) => {
    set({ currentTag: tag })
    const { router } = get()
    if (router && tag) {
      router.push("/add-tag")
    }
  },
})
