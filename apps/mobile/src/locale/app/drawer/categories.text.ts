import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      title: "Categories",
      subtitle: "Manage your spending categories",
      searchPlaceholder: "Search categories...",
      loading: "Loading categories...",
      errorTitle: "Something went wrong",
      tryAgain: "Try Again",
      emptyTitle: "No categories yet",
      emptyTitleSearch: "No categories found",
      emptyDesc: "Create your first category to start organizing your transactions",
      emptyDescSearch: "Try adjusting your search terms",
      createCategory: "Create Category",
    },
    es: {
      title: "Categorías",
      subtitle: "Administra tus categorías de gasto",
      searchPlaceholder: "Buscar categorías...",
      loading: "Cargando categorías...",
      errorTitle: "Algo salió mal",
      tryAgain: "Intentar de nuevo",
      emptyTitle: "Aún no hay categorías",
      emptyTitleSearch: "No se encontraron categorías",
      emptyDesc: "Crea tu primera categoría para organizar tus transferencias",
      emptyDescSearch: "Intenta con otros términos de búsqueda",
      createCategory: "Crear Categoría",
    },
  })
