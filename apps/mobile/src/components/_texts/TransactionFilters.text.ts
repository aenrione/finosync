import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      all: "All",
      incomes: "Incomes",
      expenses: "Expenses",
      category: "Category",
      account: "Account",
      selectCategory: "Select Category",
      selectAccount: "Select Account",
    },
    es: {
      all: "Todas",
      incomes: "Abonos",
      expenses: "Gastos",
      category: "Categoría",
      account: "Cuenta",
      selectCategory: "Seleccionar Categoría",
      selectAccount: "Seleccionar Cuenta",
    },
  })
