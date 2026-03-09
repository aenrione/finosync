import * as Localization from "expo-localization"

export const SUPPORTED_LANGUAGES = ["en", "es"] as const
export const APP_LANGUAGES = ["system", ...SUPPORTED_LANGUAGES] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type AppLanguage = (typeof APP_LANGUAGES)[number];

export const getDeviceLanguage = (): SupportedLanguage => {
  const languageCode = Localization.getLocales()[0]?.languageCode ?? "en"

  return languageCode.startsWith("es") ? "es" : "en"
}

export const resolveLanguage = (language: AppLanguage): SupportedLanguage => language === "system" ? getDeviceLanguage() : language
