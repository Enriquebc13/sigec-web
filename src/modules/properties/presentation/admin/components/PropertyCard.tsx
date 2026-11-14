import { useId, useState, type ReactNode } from "react";
import type { Property } from "../../../domain/entities/property.entity";
import { optimizedImage } from "../image-url";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "../property-labels";
import { ImageLightbox } from "./ImageLightbox";
import "./PropertyCard.css";

type Props = {
  property: Property;
  /** Contenido al pie de la tarjeta (por ejemplo, el botón "Me interesa") */
  action?: ReactNode;
};

// Moneda asumida: peso mexicano. Cámbiala si usan otra.
const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function PropertyCard({ property, action }: Props) {
  const {
    title,
    type,
    status,
    price,
    maintenanceCost,
    dimensions,
    floor,
    amenities,
    address,
    images,
  } = property;

  const [expanded, setExpanded] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const detailsId = useId();

  const total = images.length;
  // Por si la lista de imágenes cambia y el índice queda fuera de rango
  const index = total > 0 ? Math.min(imageIndex, total - 1) : 0;
  const current = images[index];

  const showPrev = () => setImageIndex((index - 1 + total) % total);
  const showNext = () => setImageIndex((index + 1) % total);

  const fullAddress = `${address.street}, ${address.city}, ${address.state} · CP ${address.zipCode}`;

  return (
    <article className={`pcard${expanded ? " pcard--open" : ""}`}>
      <div className="pcard__media">
        {current ? (
          <button
            type="button"
            className="pcard__cover"
            onClick={() => setViewerOpen(true)}
            aria-label={`Ampliar imagen ${index + 1} de ${total}`}
          >
            <img
              key={current.id}
              src={optimizedImage(current.url, 640)}
              alt={`${title} (${index + 1} de ${total})`}
              loading="lazy"
            />
          </button>
        ) : (
          <div className="pcard__placeholder">Sin imágenes</div>
        )}

        <span className="pcard__type">{PROPERTY_TYPE_LABELS[type]}</span>
        <span
          className={`pcard__status pcard__status--${status.toLowerCase()}`}
        >
          {PROPERTY_STATUS_LABELS[status]}
        </span>

        {total > 1 && (
          <>
            <button
              type="button"
              className="pcard__nav pcard__nav--prev"
              onClick={showPrev}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="pcard__nav pcard__nav--next"
              onClick={showNext}
              aria-label="Imagen siguiente"
            >
              ›
            </button>

            <div className="pcard__dots">
              {images.map((image, i) => (
                <button
                  key={image.id}
                  type="button"
                  className={`pcard__dot${i === index ? " pcard__dot--active" : ""}`}
                  onClick={() => setImageIndex(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-current={i === index}
                />
              ))}
            </div>

            <span className="pcard__count">
              📷 {index + 1}/{total}
            </span>
          </>
        )}
      </div>

      <div className="pcard__body">
        <h3 className="pcard__title" title={title}>
          {title}
        </h3>
        <p className="pcard__address" title={fullAddress}>
          📍 {fullAddress}
        </p>

        <p className="pcard__price">{money.format(price)}</p>

        <button
          type="button"
          className="pcard__toggle"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Ver menos" : "Ver más información"}
          <span className="pcard__chevron" aria-hidden="true">
            ▾
          </span>
        </button>

        <div
          id={detailsId}
          className={`pcard__expand${expanded ? " pcard__expand--open" : ""}`}
          aria-hidden={!expanded}
        >
          <div className="pcard__expand-inner">
            <dl className="pcard__details">
              <div className="pcard__detail pcard__detail--wide">
                <dt>Dirección</dt>
                <dd>{fullAddress}</dd>
              </div>
              {maintenanceCost !== null && (
                <div className="pcard__detail">
                  <dt>Mantenimiento</dt>
                  <dd>{money.format(maintenanceCost)}</dd>
                </div>
              )}
              {dimensions && (
                <div className="pcard__detail">
                  <dt>Dimensiones</dt>
                  <dd>{dimensions}</dd>
                </div>
              )}
              {floor !== null && (
                <div className="pcard__detail">
                  <dt>Piso</dt>
                  <dd>{floor}</dd>
                </div>
              )}
              {amenities && (
                <div className="pcard__detail pcard__detail--wide">
                  <dt>Amenidades</dt>
                  <dd>{amenities}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {action && <div className="pcard__action">{action}</div>}
      </div>

      {viewerOpen && total > 0 && (
        <ImageLightbox
          images={images}
          index={index}
          title={title}
          onIndexChange={setImageIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </article>
  );
}