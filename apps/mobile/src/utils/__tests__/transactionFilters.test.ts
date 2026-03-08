import { filterTransactions, getFilterStats } from "../transactionFilters"
import { Transaction } from "@/types/transaction"

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 1,
  amount: 100,
  currency: "USD",
  description: "Test transaction",
  post_date: "2024-01-01",
  transaction_date: "2024-01-01",
  transaction_type: "credit",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  ...overrides,
})

const sampleTransactions: Transaction[] = [
  makeTransaction({ id: 1, amount: 500, description: "Salary", category: { name: "Income", id: 1 }, account_id: 10 }),
  makeTransaction({ id: 2, amount: -50, description: "Coffee", category: { name: "Food", id: 2 }, account_id: 20 }),
  makeTransaction({ id: 3, amount: -200, description: "Rent", category: { name: "Housing", id: 3 }, account_id: 10 }),
  makeTransaction({ id: 4, amount: 100, description: "Freelance", category: { name: "Income", id: 1 }, account_id: 20 }),
]

const sampleCategories = [
  { name: "Income", id: 1 },
  { name: "Food", id: 2 },
  { name: "Housing", id: 3 },
]

const sampleAccounts = [
  { account_name: "Bank", id: 10 },
  { account_name: "Wallet", id: 20 },
]

describe("filterTransactions", () => {
  test("given 'All' filter, returns all transactions", () => {
    const result = filterTransactions(sampleTransactions, "All")
    expect(result).toHaveLength(4)
  })

  test("given 'Income' filter, returns only positive amounts", () => {
    const result = filterTransactions(sampleTransactions, "Income")
    expect(result).toHaveLength(2)
    result.forEach((t) => expect(t.amount).toBeGreaterThan(0))
  })

  test("given 'Expenses' filter, returns only negative amounts", () => {
    const result = filterTransactions(sampleTransactions, "Expenses")
    expect(result).toHaveLength(2)
    result.forEach((t) => expect(t.amount).toBeLessThan(0))
  })

  test("given category filter, returns transactions with matching category", () => {
    const result = filterTransactions(sampleTransactions, "Food", sampleCategories)
    expect(result).toHaveLength(1)
    expect(result[0].description).toBe("Coffee")
  })

  test("given account filter, returns transactions with matching account", () => {
    const result = filterTransactions(sampleTransactions, "Bank", [], sampleAccounts)
    expect(result).toHaveLength(2)
    result.forEach((t) => expect(t.account_id).toBe(10))
  })

  test("given unknown filter with no matching category or account, returns empty", () => {
    const result = filterTransactions(sampleTransactions, "NonExistent", sampleCategories, sampleAccounts)
    expect(result).toHaveLength(0)
  })

  test("given empty transactions, returns empty array", () => {
    expect(filterTransactions([], "All")).toHaveLength(0)
    expect(filterTransactions([], "Income")).toHaveLength(0)
  })
})

describe("getFilterStats", () => {
  test("given 'All' filter, returns stats for all transactions", () => {
    const stats = getFilterStats(sampleTransactions, "All")
    expect(stats.count).toBe(4)
    expect(stats.totalAmount).toBe(500 + (-50) + (-200) + 100)
    expect(stats.averageAmount).toBe(stats.totalAmount / 4)
  })

  test("given 'Income' filter, returns stats for positive amounts only", () => {
    const stats = getFilterStats(sampleTransactions, "Income")
    expect(stats.count).toBe(2)
    expect(stats.totalAmount).toBe(600)
    expect(stats.averageAmount).toBe(300)
  })

  test("given 'Expenses' filter, returns stats for negative amounts only", () => {
    const stats = getFilterStats(sampleTransactions, "Expenses")
    expect(stats.count).toBe(2)
    expect(stats.totalAmount).toBe(-250)
    expect(stats.averageAmount).toBe(-125)
  })

  test("given empty transactions, returns zero stats", () => {
    const stats = getFilterStats([], "All")
    expect(stats.count).toBe(0)
    expect(stats.totalAmount).toBe(0)
    expect(stats.averageAmount).toBe(0)
  })
})
