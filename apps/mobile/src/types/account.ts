export type AccountTotal = {
  code: string;
  totalAmount: string;
  investmentReturn: string;
};

export type TransactionTotal = {
  totalIncome: string;
  totalExpense: string;
  code: string;
};

export type AccountType = "local" | "fintoc" | "fintual" | "buda";

export type Account = {
  id: string | number;
  account_name: string;
  account_type: AccountType;
  code: string;
  balance?: string;
  income?: string;
  expense?: string;
  investment_return?: string;
  investments_return?: string;
  holder_name?: string;
  refreshed_at?: string;
  editable?: boolean;
  primary_key?: string;
  secret?: string;
  currency?: string;
  change_pct?: number; // Percentage change for the month
};

export type AccountFormData = {
  account_type: AccountType;
  account_name: string;
  primary_key?: string;
  secret?: string;
  currency?: string;
};
