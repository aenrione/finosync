import * as Localization from "expo-localization"

type Translations<T> = {
  en: T
  es: T
}

/**
 * Hook factory for co-located per-component translations.
 *
 * Usage in a sibling text.ts file:
 *
 *   export const useTranslation = () =>
 *     useTranslationFactory({ en: { ... }, es: { ... } })
 *
 * Then in the component:
 *
 *   import { useTranslation } from './my-screen.text'
 *   const text = useTranslation()
 */
export const useTranslationFactory = <T>(translations: Translations<T>): T => {
  const lang = Localization.getLocales()[0]?.languageCode?.startsWith("es") ? "es" : "en"
  return translations[lang]
}
