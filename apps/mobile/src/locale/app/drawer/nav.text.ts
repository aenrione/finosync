import { useTranslationFactory } from "@/shared/locale/translation";

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      navigation: {
        "(tabs)": "Home",
        shopping: "Shopping Lists",
        tags: "Tags",
        rules: "Rules",
        recurring: "Recurring",
        categories: "Categories",
        crypto: "Crypto Markets",
        settings: "Settings",
        about: "About",
      } as Record<string, string>,
    },
    es: {
      navigation: {
        "(tabs)": "Inicio",
        shopping: "Listas de Compras",
        tags: "Etiquetas",
        rules: "Reglas",
        recurring: "Recurrentes",
        categories: "Categorías",
        crypto: "Mercados Cripto",
        settings: "Ajustes",
        about: "Acerca de",
      } as Record<string, string>,
    },
  });
