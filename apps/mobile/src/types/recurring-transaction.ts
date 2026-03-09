export type RecurringFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "semi_annually" | "annually"
export type RecurringTransactionType = "expense" | "income"

export type RecurringTransaction = {
  id: number
  name: string
  amount: number
  formatted_amount?: string
  currency: string
  frequency: RecurringFrequency
  start_date: string
  end_date?: string
  next_due_date: string
  is_active: boolean
  transaction_type: RecurringTransactionType
  auto_create: boolean
  notes?: string
  transaction_category_id?: number
  account_id?: number
  account_name?: string
  category?: { name: string; id: number }
  linked_transaction_count?: number
  created_at: string
  updated_at: string
}

export type RecurringTransactionFormData = {
  name: string
  amount: number
  currency?: string
  frequency: RecurringFrequency
  start_date: string
  end_date?: string
  next_due_date: string
  is_active?: boolean
  transaction_type: RecurringTransactionType
  auto_create: boolean
  notes?: string
  transaction_category_id?: number
  account_id?: number
}
