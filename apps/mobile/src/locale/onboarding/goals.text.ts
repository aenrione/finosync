import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      title: "What are your goals?",
      subtitle: "Select all that apply — you can change these later",
      trackSpending: "Track my spending",
      budgetBetter: "Budget better",
      saveMore: "Save more money",
      manageShopping: "Manage shopping lists",
      connectBanks: "Connect bank accounts",
      trackInvestments: "Track investments",
      cta: "Continue",
    },
    es: {
      title: "¿Cuáles son tus metas?",
      subtitle: "Selecciona todas las que apliquen — puedes cambiarlas después",
      trackSpending: "Rastrear mis gastos",
      budgetBetter: "Presupuestar mejor",
      saveMore: "Ahorrar más dinero",
      manageShopping: "Gestionar listas de compras",
      connectBanks: "Conectar cuentas bancarias",
      trackInvestments: "Rastrear inversiones",
      cta: "Continuar",
    },
  })
