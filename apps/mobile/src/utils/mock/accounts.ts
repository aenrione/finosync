import { Account, AccountTotal, TransactionTotal } from "@/types/account"

// export const mockAccount: Account = {
//   id: "1",
//   account_name: "Test Account",
//   code: "123456789",
//   balance: "1000",
//   income: "200",
//   expense: "150",
//   investment_return: "50",
//   holder_name: "John Doe",
//   refreshed_at: "2023-10-01T12:00:00Z"
// }
//
// export const mockAccounts: Account[] = Array(10).fill([mockAccount]).flat().map((_, index) => ({
//   id: (index + 1).toString(),
//   account_name: `Test Account ${index + 1}`,
//   code: "CLP",
//   balance: Math.floor(Math.random() * 10000),
//   income: Math.floor(Math.random() * 1000),
//   expense: Math.floor(Math.random() * 500),
//   investment_return: Math.floor(Math.random() * 200),
//   holder_name: `Holder ${index + 1}`,
//   refreshed_at: new Date().toISOString()
// }))
  

export const mockAccountTotals: AccountTotal[] = [
  {
    code: "CLP",
    totalAmount: 10000,
    investmentReturn: 500
  },
  {
    code: "USD",
    totalAmount: 5000,
    investmentReturn: 200
  }
]

export const mockTransactionTotals: TransactionTotal[] = [
  {
    totalIncome: 3000,
    totalExpense: 1500,
    code: "CLP"
  },
  {
    totalIncome: 2000,
    totalExpense: 1000,
    code: "USD"
  }
]
