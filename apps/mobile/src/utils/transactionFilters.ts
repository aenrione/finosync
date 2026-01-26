import { Transaction } from "@/types/transaction"

export function filterTransactions(
  transactions: Transaction[],
  selectedFilter: string,
  categories: any[] = [],
  accounts: any[] = []
): Transaction[] {
  if (selectedFilter === "All") {
    return transactions
  }

  return transactions.filter(transaction => {
    switch (selectedFilter) {
    case "Income":
      return transaction.amount > 0
      
    case "Expenses":
      return transaction.amount < 0
      
    default:
      // Check if it's a category filter
      const category = categories.find(cat => cat.name === selectedFilter)
      if (category) {
        return transaction.category?.name === selectedFilter
      }
        
      // Check if it's an account filter
      const account = accounts.find(acc => acc.account_name === selectedFilter)
      if (account) {
        return transaction.account_id?.toString() === account.id.toString()
      }
        
      // If no match found, return false
      return false
    }
  })
}

export function getFilterStats(transactions: Transaction[], selectedFilter: string): {
  count: number;
  totalAmount: number;
  averageAmount: number;
} {
  const filteredTransactions = filterTransactions(transactions, selectedFilter)
  
  const count = filteredTransactions.length
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  const averageAmount = count > 0 ? totalAmount / count : 0
  
  return {
    count,
    totalAmount,
    averageAmount
  }
} 