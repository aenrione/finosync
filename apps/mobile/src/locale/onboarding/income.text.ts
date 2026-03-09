import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      title: "Monthly income",
      subtitle: "This helps us set a starting budget for you",
      placeholder: "0",
      cta: "Continue",
    },
    es: {
      title: "Ingreso mensual",
      subtitle: "Esto nos ayuda a definir un presupuesto inicial",
      placeholder: "0",
      cta: "Continuar",
    },
  })
