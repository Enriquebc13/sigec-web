import type { AutoRejectedRequest } from "../../../../properties/domain/entities/property.entity";
import {
  buildContactMessage,
  buildWhatsAppUrl,
  isWhatsAppReachable,
} from "../whatsapp";
import "./AutoRejectedNotice.css";

type Props = {
  rejected: AutoRejectedRequest[];
  onDismiss: () => void;
};

/**
 * Aviso para el admin cuando la API rechazó solicitudes por sí sola
 * (propiedad marcada como rentada o reserva liberada). Cada una trae un botón
 * para avisar por WhatsApp con el mensaje de rechazo.
 */
export function AutoRejectedNotice({ rejected, onDismiss }: Props) {
  if (rejected.length === 0) return null;

  return (
    <section className="arnotice" role="status" aria-live="polite">
      <div className="arnotice__head">
        <p className="arnotice__title">
          Se {rejected.length === 1 ? "rechazó" : "rechazaron"} automáticamente{" "}
          {rejected.length}{" "}
          {rejected.length === 1 ? "solicitud" : "solicitudes"}
        </p>
        <button type="button" className="arnotice__close" onClick={onDismiss}>
          Cerrar
        </button>
      </div>
      <p className="arnotice__text">
        Avísales por WhatsApp para que no se queden esperando:
      </p>

      <ul className="arnotice__list">
        {rejected.map((request) => {
          const fullName = `${request.applicant.name} ${request.applicant.lastname}`;
          return (
            <li key={request.id} className="arnotice__item">
              <span className="arnotice__who">
                <strong>{fullName}</strong>
                <small>
                  {request.propertyTitle} ·{" "}
                  {request.previousStatus === "APPROVED"
                    ? "estaba aprobada"
                    : "estaba pendiente"}
                </small>
              </span>

              {isWhatsAppReachable(request.telefono) ? (
                <a
                  className="arnotice__send"
                  href={buildWhatsAppUrl(
                    request.telefono,
                    buildContactMessage({
                      applicant: fullName,
                      propertyTitle: request.propertyTitle,
                      // Si estaba aprobada, el contrato se cancela de común acuerdo:
                      // mensaje neutro de contacto en vez del texto de rechazo
                      status:
                        request.previousStatus === "APPROVED"
                          ? "PENDING"
                          : "REJECTED",
                    }),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span aria-hidden="true">💬</span>{" "}
                  {request.previousStatus === "APPROVED" ? "Contactar" : "Avisar"}
                </a>
              ) : (
                <span className="arnotice__nophone">Sin WhatsApp: {request.telefono}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
