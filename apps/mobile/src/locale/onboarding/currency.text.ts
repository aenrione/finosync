import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      title: "Choose your currency",
      subtitle: "This will be your default currency for budgets and reports",
      moreCurrencies: "More currencies",
      cta: "Continue",
    },
    es: {
      title: "Elige tu moneda",
      subtitle: "Esta será tu moneda por defecto para presupuestos y reportes",
      moreCurrencies: "Más monedas",
      cta: "Continuar",
    },
  })
