import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      tagline: "Your personal finance companion",
      guest: "Guest",
      logout: "Logout",
      sections: {
        main: "Main",
        setup: "Financial Setup",
        system: "System",
      },
      items: {
        home: "Home",
        crypto: "Crypto Markets",
        categories: "Categories",
        tags: "Tags",
        recurring: "Recurring",
        settings: "Settings",
        about: "About",
      },
    },
    es: {
      tagline: "Tu compañero de finanzas personales",
      guest: "Invitado",
      logout: "Cerrar Sesión",
      sections: {
        main: "Principal",
        setup: "Configuración Financiera",
        system: "Sistema",
      },
      items: {
        home: "Inicio",
        crypto: "Mercados Cripto",
        categories: "Categorías",
        tags: "Etiquetas",
        recurring: "Recurrentes",
        settings: "Ajustes",
        about: "Acerca de",
      },
    },
  })
