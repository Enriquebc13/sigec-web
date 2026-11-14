import { useId, useState } from "react";
import { Link } from "react-router-dom";
import type { Property } from "../../../../properties/domain/entities/property.entity";
import { optimizedImage } from "../../../../properties/presentation/admin/image-url";
import type { PropertyRequest } from "../../../domain/entities/request.entity";
import { REQUEST_STATUS_LABELS } from "../../admin/request-labels";
import "./RequestCard.css";

type Props = {
  request: PropertyRequest;
  /** Propiedad de la solicitud (de la que salen el nombre y la imagen) */
  property?: Property;
  propertiesLoading: boolean;
  /** Quien envió la solicitud (el usuario de la sesión) */
  applicant?: string;
  /** Se llama al pulsar "Eliminar" (solo disponible si no está pendiente) */
  onDelete: (request: PropertyRequest, title: string) => void;
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
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  const { status, telefono, createdAt, propertyId } = request;
  const cover = property?.images[0];
  const canDelete = status !== "PENDING";

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
          {REQUEST_STATUS_LABELS[status]}
        </span>
      </div>

      <div className="rcard__body">
        <h3 className="rcard__title" title={title}>
          {title}
        </h3>
        <p className="rcard__date">Enviada el {shortDate(createdAt)}</p>

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
                <dd>{telefono}</dd>
              </div>
              <div className="rcard__detail">
                <dt>Estado</dt>
                <dd>{REQUEST_STATUS_LABELS[status]}</dd>
              </div>
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
              <button
                type="button"
                className="rcard__delete"
                disabled={!canDelete}
                onClick={() => onDelete(request, title)}
              >
                Eliminar solicitud
              </button>
              {!canDelete && (
                <p className="rcard__hint">
                  Podrás eliminarla cuando sea aprobada o rechazada.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}