import { useTranslationFactory } from "@/shared/locale/translation"

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      signIn: "Sign In",
      noAccount: "Don't have an account?",
      forgotPassword: "Forgot your password?",
    },
    es: {
      signIn: "Iniciar Sesión",
      noAccount: "¿No tienes cuenta?",
      forgotPassword: "¿Olvidaste tu contraseña?",
    },
  })
