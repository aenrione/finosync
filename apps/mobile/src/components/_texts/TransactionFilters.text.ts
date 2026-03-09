import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      all: "All",
      incomes: "Incomes",
      expenses: "Expenses",
    },
    es: {
      all: "Todas",
      incomes: "Abonos",
      expenses: "Gastos",
    },
  })
