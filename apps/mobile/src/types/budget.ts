export type BudgetItem = {
  id: number;
  title: string;
  description?: string;
  price: number;
  purchase_date?: string;
  purchased: boolean;
  source_href?: string;
  created_at: string;
  updated_at: string;
};

export type BudgetList = {
  id: number;
  title: string;
  description?: string;
  total_budget: number;
  total: number;
  start_date: string;
  end_date: string;
  items: BudgetItem[];
  created_at: string;
  updated_at: string;
};

export type BudgetStats = {
  totalBudgets: number;
  activeBudgets: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  averageBudget: number;
  savingsRate: number;
  completionRate: number;
  overBudgetCount: number;
  purchasedItems: number;
  totalItems: number;
};

export type BudgetFormData = {
  title: string;
  description?: string;
  total_budget: number;
  start_date: string;
  end_date: string;
};

export type BudgetItemFormData = {
  title: string;
  description?: string;
  price: number;
  purchase_date?: string;
  purchased: boolean;
  source_href?: string;
}; 