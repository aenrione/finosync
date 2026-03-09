import { useTranslation as useI18nTranslation } from "react-i18next"

const texts = {
  logout: {
    en: "Logout",
    es: "Cerrar sesión",
  },
} as const

type TextKey = keyof typeof texts

export function useTranslation() {
  const { i18n } = useI18nTranslation()
  const lang = (i18n.language?.startsWith("es") ? "es" : "en") as "en" | "es"

  const result: Record<TextKey, string> = {} as any
  for (const key of Object.keys(texts) as TextKey[]) {
    result[key] = texts[key][lang]
  }
  return result
}
