import { StateCreator } from "zustand"

import { Tag } from "@/types/tag"

import { RouterSlice } from "./router.store"

export interface TagSlice {
  currentTag?: Tag
  setCurrentTag: (tag?: Tag) => void
}

export const createTagSlice: StateCreator<
  TagSlice & RouterSlice,
  [],
  [],
  TagSlice
> = (set, get) => ({
  currentTag: undefined,
  setCurrentTag: (tag) => {
    set({ currentTag: tag })
    const { router } = get()
    if (router && tag) {
      router.push("/add-tag")
    }
  },
})
