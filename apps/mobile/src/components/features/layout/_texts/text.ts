import { useTranslationFactory } from "@/shared/locale/translation";

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      tagline: "Your personal finance companion",
      timeRange: "Time Range",
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
        feedback: "Feedback",
      },
    },
    es: {
      tagline: "Tu compañero de finanzas personales",
      timeRange: "Rango de Tiempo",
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
        feedback: "Comentarios",
      },
    },
  });
