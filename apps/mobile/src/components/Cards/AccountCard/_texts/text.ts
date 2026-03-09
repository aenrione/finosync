import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      types: {
        local: "Local account",
        fintoc: "Bank account",
        fintual: "Fintual account",
        buda: "Buda account",
      },
    },
    es: {
      types: {
        local: "Cuenta local",
        fintoc: "Cuenta bancaria",
        fintual: "Objetivo Fintual",
        buda: "Cuenta Buda",
      },
    },
  })
