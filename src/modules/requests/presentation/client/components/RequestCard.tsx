import { useId, useState } from "react";
import { Link } from "react-router-dom";
import type { Property } from "../../../../properties/domain/entities/property.entity";
import { optimizedImage } from "../../../../properties/presentation/admin/image-url";
import type { PropertyRequest } from "../../../domain/entities/request.entity";
import { SIGEC_CONTACT } from "../../../../../core/config/contact";
import { displayStatusLabel } from "../../admin/request-labels";
import "./RequestCard.css";

type Props = {
  request: PropertyRequest;
  /** Propiedad de la solicitud (de la que salen el nombre y la imagen) */
  property?: Property;
  propertiesLoading: boolean;
  /** Quien envió la solicitud (el usuario de la sesión) */
  applicant?: string;
  /** Se llama al pulsar "Eliminar" (solo disponible si fue rechazada) */
  onDelete: (request: PropertyRequest, title: string) => void;
  /** Se llama al pulsar "Cancelar solicitud" (solo si está pendiente) */
  onCancel: (request: PropertyRequest, title: string) => void;
  /** Se llama al pulsar "Editar" junto al teléfono (pendiente o aprobada) */
  onEditPhone: (request: PropertyRequest, title: string) => void;
};

const shortDate = (date: Date) =>
  date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fullDate = (date: Date) =>
  date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function RequestCard({
  request,
  property,
  propertiesLoading,
  applicant,
  onDelete,
  onCancel,
  onEditPhone,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  const {
    status,
    telefono,
    createdAt,
    propertyId,
    posicionListaEspera,
    cancelledByApplicant,
  } = request;
  const statusLabel = displayStatusLabel(status, cancelledByApplicant);
  const cover = property?.images[0];
  // Pendiente: está en la fila. Aprobada: tiene la propiedad reservada.
  const canDelete = status === "REJECTED";
  const canCancel = status === "PENDING";
  // El teléfono se puede corregir mientras la solicitud siga viva
  const canEditPhone = status === "PENDING" || status === "APPROVED";
  const position = status === "PENDING" ? posicionListaEspera : null;
  // Aprobada y la propiedad ya está rentada: el contrato es de este cliente
  const rentedByMe = status === "APPROVED" && property?.status === "RENTED";

  const title = property
    ? property.title
    : propertiesLoading
      ? "…"
      : "Propiedad no disponible";

  const image = cover ? (
    <img src={optimizedImage(cover.url, 640)} alt={title} loading="lazy" />
  ) : (
    <div className="rcard__placeholder">Sin imagen</div>
  );

  return (
    <article className={`rcard${expanded ? " rcard--open" : ""}`}>
      <div className="rcard__media">
        {property ? (
          // La imagen lleva al catálogo y enfoca esta propiedad
          <Link
            to={`/client/properties?property=${propertyId}`}
            className="rcard__cover"
            aria-label={`Ver ${title} en el catálogo`}
          >
            {image}
            <span className="rcard__cover-label">Ver en catálogo →</span>
          </Link>
        ) : (
          image
        )}

        <span className={`rcard__status rcard__status--${status.toLowerCase()}`}>
          {statusLabel}
        </span>
      </div>

      <div className="rcard__body">
        <h3 className="rcard__title" title={title}>
          {title}
        </h3>
        <p className="rcard__date">Enviada el {shortDate(createdAt)}</p>

        {position !== null && (
          <p className="rcard__position">
            <span aria-hidden="true">⏳</span> Lugar #{position} en la lista de
            espera
          </p>
        )}

        {rentedByMe && (
          <p className="rcard__rented">
            <span aria-hidden="true">🏠</span> Rentada por ti
          </p>
        )}

        <button
          type="button"
          className="rcard__toggle"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Ver menos" : "Más información"}
          <span className="rcard__chevron" aria-hidden="true">
            ▾
          </span>
        </button>

        <div
          id={detailsId}
          className={`rcard__expand${expanded ? " rcard__expand--open" : ""}`}
          aria-hidden={!expanded}
        >
          <div className="rcard__expand-inner">
            <dl className="rcard__details">
              <div className="rcard__detail">
                <dt>Teléfono</dt>
                <dd>
                  {telefono}
                  {canEditPhone && (
                    <button
                      type="button"
                      className="rcard__link"
                      onClick={() => onEditPhone(request, title)}
                    >
                      Editar
                    </button>
                  )}
                </dd>
              </div>
              <div className="rcard__detail">
                <dt>Estado</dt>
                <dd>{statusLabel}</dd>
              </div>
              {position !== null && (
                <div className="rcard__detail">
                  <dt>Lista de espera</dt>
                  <dd>Lugar #{position}</dd>
                </div>
              )}
              <div className="rcard__detail rcard__detail--wide">
                <dt>Enviada</dt>
                <dd>{fullDate(createdAt)}</dd>
              </div>
              {applicant && (
                <div className="rcard__detail rcard__detail--wide">
                  <dt>Solicitante</dt>
                  <dd>{applicant}</dd>
                </div>
              )}
              <div className="rcard__detail rcard__detail--wide">
                <dt>Propiedad</dt>
                <dd>{title}</dd>
              </div>
            </dl>

            <div className="rcard__danger">
              {canCancel ? (
                <button
                  type="button"
                  className="rcard__delete"
                  onClick={() => onCancel(request, title)}
                >
                  Cancelar solicitud
                </button>
              ) : (
                <button
                  type="button"
                  className="rcard__delete"
                  disabled={!canDelete}
                  onClick={() => onDelete(request, title)}
                >
                  Eliminar solicitud
                </button>
              )}

              {status === "PENDING" && (
                <p className="rcard__hint">
                  Saldrás de la lista de espera y quienes estén detrás de ti
                  avanzarán un lugar.
                </p>
              )}
              {status === "APPROVED" && (
                <p className="rcard__hint">
                  {rentedByMe
                    ? "Para cancelar el contrato, contáctanos: "
                    : "Una solicitud aprobada se cancela con el administrador: "}
                  <a href={`mailto:${SIGEC_CONTACT.email}`}>
                    {SIGEC_CONTACT.email}
                  </a>{" "}
                  o{" "}
                  <a href={`tel:${SIGEC_CONTACT.phoneHref}`}>
                    {SIGEC_CONTACT.phone}
                  </a>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}