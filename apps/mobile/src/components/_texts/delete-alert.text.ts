import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      confirmTitle: "Confirm Deletion",
      confirmMessage: "Are you sure you want to delete this item?",
      cancel: "Cancel",
      delete: "Delete",
    },
    es: {
      confirmTitle: "Confirmar Eliminación",
      confirmMessage: "¿Estás seguro de que quieres eliminar este elemento?",
      cancel: "Cancelar",
      delete: "Eliminar",
    },
  })
