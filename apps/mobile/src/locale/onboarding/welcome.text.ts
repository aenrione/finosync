import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      headline: "Take control of your finances",
      bullet1: "Track your spending across all accounts",
      bullet2: "Connect your bank and investment accounts",
      bullet3: "Budget smarter with automated rules",
      cta: "Get Started",
    },
    es: {
      headline: "Toma el control de tus finanzas",
      bullet1: "Rastrea tus gastos en todas tus cuentas",
      bullet2: "Conecta tus cuentas bancarias e inversiones",
      bullet3: "Presupuesta mejor con reglas automáticas",
      cta: "Comenzar",
    },
  })
