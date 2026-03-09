import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      titleNew: "New Category",
      titleEdit: "Edit Category",
      icon: "Category Icon",
      iconPlaceholder: "Choose Icon",
      name: "Category name",
      namePlaceholder: "Ex: Travel",
      desc: "Description",
      descPlaceholder: "Ex: for groceries",
      save: "Save",
      creating: "Creating...",
      updating: "Updating...",
      errorTitle: "Error",
      errorFail: "Failed to save category",
    },
    es: {
      titleNew: "Nueva Categoría",
      titleEdit: "Editar Categoría",
      icon: "Icono",
      iconPlaceholder: "Elige un icono",
      name: "Nombre de Categoría",
      namePlaceholder: "Ej: Viaje",
      desc: "Descripción",
      descPlaceholder: "Ej: para pasajes",
      save: "Guardar",
      creating: "Creando...",
      updating: "Actualizando...",
      errorTitle: "Error",
      errorFail: "Error al guardar la categoría",
    },
  })
