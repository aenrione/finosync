import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      home: "Home",
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
    es: {
      home: "Inicio",
      morning: "Buenos días",
      afternoon: "Buenas tardes",
      evening: "Buenas noches",
    },
  })
