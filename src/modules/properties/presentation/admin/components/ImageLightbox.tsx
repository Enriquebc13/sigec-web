import { useEffect } from "react";
import { createPortal } from "react-dom";
//Cuando se abre para ver una imagen

import "./ImageLightbox.css";
import type { PropertyImage } from "../../../../properties/domain/entities/property.entity";
import { optimizedImage } from "../image-url";

type Props = {
  images: PropertyImage[];
  index: number;
  title: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

export function ImageLightbox({
  images,
  index,
  title,
  onIndexChange,
  onClose,
}: Props) {
  const total = images.length;
  const image = images[index];

  // Teclado: Esc cierra, ← → cambian de imagen
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (total < 2) return;
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + total) % total);
      if (e.key === "ArrowRight") onIndexChange((index + 1) % total);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, total, onIndexChange, onClose]);

  // Bloquea el scroll de la página mientras el visor está abierto
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!image) return null;

  // Portal: la tarjeta tiene transform en :hover y eso rompería el position: fixed
  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Imágenes de ${title}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="lightbox__close"
        onClick={onClose}
        aria-label="Cerrar"
        autoFocus
      >
        ×
      </button>

      {total > 1 && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          onClick={() => onIndexChange((index - 1 + total) % total)}
          aria-label="Imagen anterior"
        >
          ‹
        </button>
      )}

      <figure className="lightbox__figure">
        <img
          key={image.id}
          src={optimizedImage(image.url, 1600)}
          alt={`${title} (${index + 1} de ${total})`}
        />
        <figcaption className="lightbox__caption">
          {title} · {index + 1} de {total}
        </figcaption>
      </figure>

      {total > 1 && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          onClick={() => onIndexChange((index + 1) % total)}
          aria-label="Imagen siguiente"
        >
          ›
        </button>
      )}
    </div>,
    document.body,
  );
}