import { initReactI18next } from "react-i18next"
import i18n from "i18next"

// Translations are co-located per-component in src/locale/ and src/components/**/_texts/ directories.
// This file only initialises i18next so language detection works via i18n.language.
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    fallbackLng: "es",
    resources: {},
    react: {
      useSuspense: false,
    },
  })

export default i18n
