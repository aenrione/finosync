export type CategoryGroup = {
  id: number;
  name: string;
  display_order: number;
  group_type: "income" | "expense" | "savings" | "debt";
};

export type BudgetPeriod = {
  id: number;
  year: number;
  month: number;
  status: "open" | "closed";
};

export type BudgetAllocation = {
  id: number | null;
  planned_amount: number;
  actual_spend: number;
  remaining: number;
  rollover_in: number;
  transaction_category_id: number;
  category_name: string;
  category_icon: string;
  notes?: string;
};

export type BudgetGroupSummary = {
  group: CategoryGroup;
  allocations: BudgetAllocation[];
  group_total_planned: number;
  group_total_actual: number;
  group_total_remaining: number;
};

export type UnbudgetedCategory = {
  id: number;
  name: string;
  icon: string;
  actual_spend: number;
};

export type BudgetSummary = {
  period: BudgetPeriod;
  left_to_budget: number;
  total_income: number;
  total_planned: number;
  total_actual: number;
  groups: BudgetGroupSummary[];
  unbudgeted_categories: UnbudgetedCategory[];
};
