import { useQuery } from "react-query"

import { recurringTransactionService } from "@/services/recurring-transaction.service"
import { fetchBudgetSummary } from "@/services/budget-period.service"
import { RecurringTransaction } from "@/types/recurring-transaction"
import { BudgetSummary } from "@/types/budget-period"
import { useStore } from "@/utils/store"

const getCurrentPeriod = () => {
  const now = new Date()

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

export function useDashboardBudgetSummary() {
  const baseCurrency = useStore((state) => state.baseCurrency)
  const { year, month } = getCurrentPeriod()

  return useQuery<BudgetSummary>(
    ["dashboard-budget-summary", year, month, baseCurrency],
    () => fetchBudgetSummary(year, month, baseCurrency),
  )
}

export function useDashboardUpcomingRecurring(days = 14) {
  const baseCurrency = useStore((state) => state.baseCurrency)

  return useQuery<RecurringTransaction[]>(
    ["dashboard-upcoming-recurring", baseCurrency, days],
    async () => {
      const items = await recurringTransactionService.fetchAll({
        active: true,
        upcoming: days,
      })

      return items
        .filter(
          (item) =>
            item.transaction_type === "expense" &&
            item.currency === baseCurrency,
        )
        .sort(
          (a, b) =>
            new Date(a.next_due_date).getTime() -
            new Date(b.next_due_date).getTime(),
        )
    },
  )
}
