import { useTranslationFactory } from "@/shared/locale/translation";

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      navigation: {
        dashboard: "Home",
        accounts: "Accounts",
        transactions: "Activity",
        "cash-flow": "Cashflow",
        budget: "Budget",
      } as Record<string, string>,
    },
    es: {
      navigation: {
        dashboard: "Inicio",
        accounts: "Cuentas",
        transactions: "Actividad",
        "cash-flow": "Flujo",
        budget: "Presup.",
      } as Record<string, string>,
    },
  });
