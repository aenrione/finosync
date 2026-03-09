import { useTranslationFactory } from "@/shared/locale/translation";

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      navigation: {
        dashboard: "Dashboard",
        accounts: "Accounts",
        transactions: "Transactions",
        "cash-flow": "Cash Flow",
        budget: "Budget",
      } as Record<string, string>,
    },
    es: {
      navigation: {
        dashboard: "Panel",
        accounts: "Cuentas",
        transactions: "Movimientos",
        "cash-flow": "Flujo",
        budget: "Presupuesto",
      } as Record<string, string>,
    },
  });
