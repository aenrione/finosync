import { initReactI18next } from "react-i18next"
import i18n from "i18next"

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    fallbackLng: "es",
    debug: true,
    resources: {
      en: {
        translation: require("./en.json"),
      },
      es: {
        translation: require("./es.json"),
      },
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n

