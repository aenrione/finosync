type BalanceChartData = {
  labels: string[];            // Optional: might be empty or filled
  data: number[];              // Raw numerical balance values
  dates: string[];             // ISO date strings (e.g., "2025-06-01")
  formated_data: string[];     // Formatted currency strings (e.g., "$1,000.00")
  formatted_dates: string[];   // Human-readable dates (e.g., "01 Jun")
};

export type UserBalanceChart = {
  user: BalanceChartData;
  fintoc_account?: BalanceChartData;
  buda_account?: BalanceChartData;
  fintual_account?: BalanceChartData;
};

type TransactionCategoryAmount = {
  name: string;    // Category name or "N.C" for no category
  amount: number;  // Integer amount, probably in smallest currency unit (e.g., cents)
};

export type TransactionsToChartResult = {
  data: TransactionCategoryAmount[];
  total: string;  // Formatted string of total amount (e.g., "$1,200.00")
};

