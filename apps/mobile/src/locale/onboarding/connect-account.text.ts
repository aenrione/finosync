import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      title: "Add an account",
      subtitle: "Connect or create an account to start tracking",
      local: "Manual account",
      localDesc: "Track accounts manually",
      fintoc: "Bank account",
      fintocDesc: "Connect your bank",
      buda: "Buda",
      budaDesc: "Connect crypto exchange",
      fintual: "Fintual",
      fintualDesc: "Connect investments",
      skip: "Skip for now",
      done: "Finish Setup",
    },
    es: {
      title: "Agrega una cuenta",
      subtitle: "Conecta o crea una cuenta para comenzar a rastrear",
      local: "Cuenta manual",
      localDesc: "Rastrea cuentas manualmente",
      fintoc: "Cuenta bancaria",
      fintocDesc: "Conecta tu banco",
      buda: "Buda",
      budaDesc: "Conecta exchange de criptomonedas",
      fintual: "Fintual",
      fintualDesc: "Conecta inversiones",
      skip: "Omitir por ahora",
      done: "Finalizar configuración",
    },
  })
