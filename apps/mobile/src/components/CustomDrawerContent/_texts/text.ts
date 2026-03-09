import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      logout: "Log Out",
    },
    es: {
      logout: "Salir",
    },
  })
