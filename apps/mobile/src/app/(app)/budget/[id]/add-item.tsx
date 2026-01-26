import { useLocalSearchParams, useRouter } from "expo-router"
import React from "react"

import { BudgetItemForm } from "@/components/BudgetItemForm"
import { BudgetItem } from "@/types/budget"

export default function AddBudgetItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const handleSave = (item: Omit<BudgetItem, "id">) => {
    // In a real app, save the item to the backend or state here
    // For now, just log and go back
    console.log("Saving new item for budget", id, item)
    router.replace({ pathname: "/(app)/budget/[id]", params: { id: id?.toString() } })
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <BudgetItemForm onSave={handleSave} onCancel={handleCancel} />
  )
} 