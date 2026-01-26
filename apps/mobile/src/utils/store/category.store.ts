import { StateCreator } from "zustand"

import { Category } from "@/types/category"

export interface CategorySlice {
  currentCategory?: Category
  setCurrentCategory: (tx: Category) => void
}

export const createCategorySlice: StateCreator<CategorySlice & { router: any }> = (set, get) => ({
  currentCategory: undefined,
  setCurrentCategory: (category) => {
    set({ currentCategory: category })
    const { router } = get()
    if (router) {
      router.push("/add-category")
    }
  }
})


