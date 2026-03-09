import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      cancel: "Cancel",
    },
    es: {
      cancel: "Cancelar",
    },
  })
