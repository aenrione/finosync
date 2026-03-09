import { useTranslationFactory } from "@/shared/locale/translation"

type DeleteConfirmationParams = { name: string }

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      deleteTitle: "Delete Account",
      deleteConfirmation: ({ name }: DeleteConfirmationParams) =>
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      notFound: "Account not found",
      currentBalance: "Current Balance",
      accountNumber: "Account Number",
      accountType: "Account Type",
      lastTransaction: "Last Transaction",
      noTransactions: "No transactions",
      insights: "This Month's Insights",
      totalIncome: "Total Income",
      totalExpenses: "Total Expenses",
      transactions: "Transactions",
      avgTransaction: "Avg Transaction",
      topCategory: "Top Spending Category",
      recentTransactions: "Recent Transactions",
      noTransactionsForAccount: "No transactions for this account",
      noFilteredTransactions: (filter: string) =>
        `No ${filter.toLowerCase()} transactions for this account`,
    },
    es: {
      deleteTitle: "Eliminar Cuenta",
      deleteConfirmation: ({ name }: DeleteConfirmationParams) =>
        `¿Estás seguro de que quieres eliminar "${name}"? Esta acción no se puede deshacer.`,
      notFound: "Cuenta no encontrada",
      currentBalance: "Saldo Actual",
      accountNumber: "Número de Cuenta",
      accountType: "Tipo de Cuenta",
      lastTransaction: "Última Transferencia",
      noTransactions: "Sin transferencias",
      insights: "Resumen del Mes",
      totalIncome: "Total Abonos",
      totalExpenses: "Total Gastos",
      transactions: "Transferencias",
      avgTransaction: "Promedio por Transf.",
      topCategory: "Categoría con más Gastos",
      recentTransactions: "Transferencias Recientes",
      noTransactionsForAccount: "Sin transferencias para esta cuenta",
      noFilteredTransactions: (filter: string) =>
        `Sin transferencias de tipo ${filter.toLowerCase()} para esta cuenta`,
    },
  })
