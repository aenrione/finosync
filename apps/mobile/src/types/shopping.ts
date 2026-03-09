import { Transaction } from "@/types/transaction";

export type ShoppingBudgetAllocation = {
  id: number;
  planned_amount: number;
  rollover_in: number;
  notes?: string;
  transaction_category_id: number;
  category_name: string;
  category_icon: string;
  budget_period_id: number;
  budget_period_year: number;
  budget_period_month: number;
};

export type ShoppingItem = {
  id: number;
  title: string;
  description?: string;
  price: number;
  formatted_price?: string;
  purchase_date?: string;
  purchased: boolean;
  source_href?: string;
  transaction?: Transaction;
  created_at: string;
  updated_at: string;
};

export type ShoppingList = {
  id: number;
  title: string;
  description?: string;
  total_budget: number;
  total: number;
  formatted_total?: string;
  formatted_total_budget?: string;
  start_date: string;
  end_date: string;
  items: ShoppingItem[];
  budget_allocation?: ShoppingBudgetAllocation;
  item_count?: number;
  purchased_count?: number;
  created_at: string;
  updated_at: string;
};

export type ShoppingListStats = {
  totalLists: number;
  activeLists: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  averageBudget: number;
  completionRate: number;
  overBudgetCount: number;
  purchasedItems: number;
  totalItems: number;
};

export type ShoppingListFormData = {
  title: string;
  description?: string;
  total_budget: number;
  start_date: string;
  end_date: string;
  budget_allocation_id?: number;
};

export type ShoppingItemFormData = {
  title: string;
  description?: string;
  price: number;
  purchase_date?: string;
  source_href?: string;
};

export type ShoppingItemUpdateData = Partial<ShoppingItemFormData> & {
  transaction_id?: number | null;
};
