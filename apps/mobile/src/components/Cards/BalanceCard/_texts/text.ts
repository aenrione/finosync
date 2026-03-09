import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      myBalance: "My Balance",
      returns: "Investments",
      incomes: "Total Income",
      expenses: "Total Expenses",
    },
    es: {
      myBalance: "Mi Saldo",
      returns: "Inversiones",
      incomes: "Abonos Totales",
      expenses: "Gastos Totales",
    },
  })
