import { useStore } from "@/utils/store"

import { resolveLanguage, type SupportedLanguage } from "./config"

type Translations<T> = {
  [key in SupportedLanguage]: T;
};

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
  const language = useStore((state) => state.language)

  return translations[resolveLanguage(language)]
}
