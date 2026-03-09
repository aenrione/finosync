import { useTranslationFactory } from "@/shared/locale/translation";

export const useTranslation = () =>
  useTranslationFactory({
    en: {
      title: "Feedback",
      sectionTitle: "Your Feedback",
      sectionDescription:
        "Help us improve FinoSync by sharing your thoughts, suggestions, or bug reports.",
      label: "Message",
      placeholder: "Tell us what you think... (minimum 10 characters)",
      send: "Send Feedback",
      sending: "Sending...",
      successTitle: "Thank you!",
      successMessage: "Your feedback has been sent successfully.",
      errorTitle: "Error",
    },
    es: {
      title: "Comentarios",
      sectionTitle: "Tu Opinión",
      sectionDescription:
        "Ayúdanos a mejorar FinoSync compartiendo tus ideas, sugerencias o reportes de errores.",
      label: "Mensaje",
      placeholder: "Cuéntanos qué piensas... (mínimo 10 caracteres)",
      send: "Enviar Comentario",
      sending: "Enviando...",
      successTitle: "¡Gracias!",
      successMessage: "Tu comentario ha sido enviado exitosamente.",
      errorTitle: "Error",
    },
  });
