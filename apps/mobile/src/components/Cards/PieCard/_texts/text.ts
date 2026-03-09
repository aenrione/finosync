import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      saved: "Saved",
      expenses: "Expenses",
    },
    es: {
      saved: "Ahorrado",
      expenses: "Gastos",
    },
  })
