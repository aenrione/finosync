import { useTranslationFactory } from "@/shared/locale/translation";

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
        shopping: "Shopping Lists",
        crypto: "Crypto Markets",
        categories: "Categories",
        tags: "Tags",
        rules: "Rules",
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
        shopping: "Listas de Compras",
        crypto: "Mercados Cripto",
        categories: "Categorías",
        tags: "Etiquetas",
        rules: "Reglas",
        recurring: "Recurrentes",
        settings: "Ajustes",
        about: "Acerca de",
      },
    },
  });
