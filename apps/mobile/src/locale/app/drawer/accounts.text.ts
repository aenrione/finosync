import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      title: "Accounts",
      netWorth: "Net Worth",
      totalAssets: "Total Assets",
      totalLiabilities: "Total Liabilities",
      accountCountLabel: "Accounts",
      addAccount: "Add Account",
      noAccounts: "No accounts yet",
      noAccountsDescription:
        "Add your first account to start tracking your finances.",
      errorTitle: "Could not load accounts",
      lastUpdated: "Updated",
      income: "Income",
      expenses: "Expenses",
      returnLabel: "return",
      thisMonth: "this month",
      accountCount: (n: number) => `${n} account${n === 1 ? "" : "s"}`,
      accountTypes: {
        local: "Cash",
        fintoc: "Bank",
        fintual: "Investment",
        buda: "Crypto",
      },
      groups: {
        liabilities: "Liabilities",
        cash: "Cash",
        banking: "Banking",
        investments: "Investments",
        crypto: "Crypto",
      },
      timeAgo: {
        now: "just now",
        minutes: (n: number) => `${n}m ago`,
        hours: (n: number) => `${n}h ago`,
        days: (n: number) => `${n}d ago`,
      },
    },
    es: {
      title: "Cuentas",
      netWorth: "Patrimonio Neto",
      totalAssets: "Activos Totales",
      totalLiabilities: "Pasivos Totales",
      accountCountLabel: "Cuentas",
      addAccount: "Agregar Cuenta",
      noAccounts: "Sin cuentas aún",
      noAccountsDescription:
        "Agrega tu primera cuenta para comenzar a controlar tus finanzas.",
      errorTitle: "No se pudieron cargar las cuentas",
      lastUpdated: "Actualizado",
      income: "Abonos",
      expenses: "Gastos",
      returnLabel: "rentabilidad",
      thisMonth: "este mes",
      accountCount: (n: number) => `${n} cuenta${n === 1 ? "" : "s"}`,
      accountTypes: {
        local: "Efectivo",
        fintoc: "Banco",
        fintual: "Inversion",
        buda: "Crypto",
      },
      groups: {
        liabilities: "Pasivos",
        cash: "Efectivo",
        banking: "Bancarias",
        investments: "Inversiones",
        crypto: "Crypto",
      },
      timeAgo: {
        now: "ahora",
        minutes: (n: number) => `hace ${n}m`,
        hours: (n: number) => `hace ${n}h`,
        days: (n: number) => `hace ${n}d`,
      },
    },
  })
