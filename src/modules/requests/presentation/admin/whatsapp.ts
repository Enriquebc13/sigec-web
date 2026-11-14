import type { RequestStatus } from "../../domain/entities/request-history.entity";

// Lada de México. Cámbiala si el sistema se usa en otro país.
const COUNTRY_CODE = "52";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** wa.me pide el número en formato internacional: solo dígitos y sin "+" */
export function toWhatsAppNumber(telefono: string): string {
  const digits = onlyDigits(telefono);
  // Los teléfonos de la solicitud son de 10 dígitos: se les agrega la lada del país
  return digits.length === 10 ? `${COUNTRY_CODE}${digits}` : digits;
}

/** Evita armar enlaces con números demasiado cortos */
export const isWhatsAppReachable = (telefono: string) =>
  onlyDigits(telefono).length >= 10;

type MessageParams = {
  applicant: string;
  /** Título real de la propiedad; si no se conoce, el mensaje no la menciona */
  propertyTitle?: string;
  status: RequestStatus;
};

// ⚠️ Estos textos son un ejemplo: ajústalos al tono que quieran usar
export function buildContactMessage({
  applicant,
  propertyTitle,
  status,
}: MessageParams): string {
  const firstName = applicant.trim().split(" ")[0];
  const about = propertyTitle ? ` para «${propertyTitle}»` : "";

  switch (status) {
    case "APPROVED":
      return `Hola ${firstName}, tu solicitud${about} fue aprobada. Te escribimos de SIGEC para coordinar los siguientes pasos.`;
    case "REJECTED":
      return `Hola ${firstName}, gracias por tu interés${
        propertyTitle ? ` en «${propertyTitle}»` : ""
      }. Por ahora no pudimos aprobar tu solicitud, pero con gusto te ayudamos a revisar otras opciones.`;
    default:
      return `Hola ${firstName}, te escribimos de SIGEC sobre tu solicitud${about}. ¿Tienes un momento para platicar?`;
  }
}

export function buildWhatsAppUrl(telefono: string, message: string): string {
  return `https://wa.me/${toWhatsAppNumber(telefono)}?text=${encodeURIComponent(message)}`;
}