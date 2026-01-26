import { TransactionsToChartResult } from "@/types/charts"

export const mockTransactionsChart: TransactionsToChartResult = {
  data: [
    { name: "N.C", amount: -5000 },       // No category transactions
    { name: "Groceries", amount: -25000 },
    { name: "Utilities", amount: -12000 },
    { name: "Entertainment", amount: -8000 },
  ],
  total: "-$50,000.00",  // Sum of all amounts formatted (example)
}

