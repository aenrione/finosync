"use client"
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react"

import { fetchWithAuth } from "@/utils/api"
import { Category } from "@/types/category"

type CategoriesContextType = {
  categoriesData: Category[]
  filteredCategories: Category[]
  loading: boolean
  error: string | null
  searchTerm: string
  setSearchTerm: (term: string) => void
  refreshData: () => Promise<void>
  createCategory: (data: CategoryFormData) => Promise<Category>
  updateCategory: (id: number, data: Partial<CategoryFormData>) => Promise<Category>
  deleteCategory: (id: number) => Promise<void>
}

type CategoryFormData = {
  name: string
  description?: string
  icon?: string
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categoriesData, setCategoriesData] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  const fetchCategories = useCallback(async (search?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const url = search 
        ? `/transaction_categories?search=${encodeURIComponent(search)}`
        : "/transaction_categories"
      
      const res = await fetchWithAuth(url)
      
      // Check if response is ok
      if (!res.ok) {
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json()
          throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`)
        } else {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
      }

      // Check content type before parsing JSON
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format: expected JSON")
      }

      const data = await res.json()
      setCategoriesData(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setCategoriesData([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categoriesData
    
    const term = searchTerm.toLowerCase()
    return categoriesData.filter(category => 
      category.name.toLowerCase().includes(term) ||
      (category.description && category.description.toLowerCase().includes(term))
    )
  }, [categoriesData, searchTerm])

  const createCategory = useCallback(async (formData: CategoryFormData): Promise<Category> => {
    const response = await fetchWithAuth("/transaction_categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create category")
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid response format: expected JSON")
    }

    const newCategory = await response.json()
    await fetchCategories()
    return newCategory
  }, [fetchCategories])

  const updateCategory = useCallback(async (id: number, formData: Partial<CategoryFormData>): Promise<Category> => {
    const response = await fetchWithAuth(`/transaction_categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update category")
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid response format: expected JSON")
    }

    const updatedCategory = await response.json()
    await fetchCategories()
    return updatedCategory
  }, [fetchCategories])

  const deleteCategory = useCallback(async (id: number): Promise<void> => {
    const response = await fetchWithAuth(`/transaction_categories/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete category")
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    }

    await fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const contextValue = useMemo(
    () => ({
      categoriesData,
      filteredCategories,
      loading,
      error,
      searchTerm,
      setSearchTerm,
      refreshData: fetchCategories,
      createCategory,
      updateCategory,
      deleteCategory,
    }),
    [categoriesData, filteredCategories, loading, error, searchTerm, fetchCategories, createCategory, updateCategory, deleteCategory]
  )

  return (
    <CategoriesContext.Provider value={contextValue}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories(): CategoriesContextType {
  const context = useContext(CategoriesContext)
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider")
  }
  return context
} 