import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      noDescription: "No description",
      loading: "Loading...",
      loadMore: "Load more transactions",
    },
    es: {
      noDescription: "Sin descripción",
      loading: "Cargando...",
      loadMore: "Cargar más transferencias",
    },
  })
