"use client"
import { TransactionsProvider } from "@/context/transactions.context"
import { BalancesProvider } from "@/context/user-balance.context"
import { CategoriesProvider } from "@/context/categories.context"
import { DashboardProvider } from "@/context/dashboard.context"
import { AccountsProvider } from "@/context/accounts.context"
import { ChartsProvider } from "@/context/charts.context"

export function GlobalProvider({ children }:{ children: React.ReactNode }) {
  return (
    <AccountsProvider>
      <DashboardProvider>
        <TransactionsProvider>
          <BalancesProvider>
            <CategoriesProvider>
              <ChartsProvider>
                {children}
              </ChartsProvider>
            </CategoriesProvider>
          </BalancesProvider>
        </TransactionsProvider>
      </DashboardProvider>
    </AccountsProvider>
  )
}