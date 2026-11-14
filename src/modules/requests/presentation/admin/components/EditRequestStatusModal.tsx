import { useEffect, useState, type FormEvent } from "react";
import type { DecisionStatus } from "../../../domain/entities/request.entity";
import type { RequestStatus } from "../../../domain/entities/request-history.entity";
import { useUpdateRequestStatus } from "../hooks/use-update-request-status";
import { REQUEST_STATUS_LABELS } from "../request-labels";
import "./EditRequestStatusModal.css";

type Props = {
  requestId: string;
  currentStatus: RequestStatus;
  applicant: string;
  telefono: string;
  propertyTitle: string;
  /** Devuelve el enlace de WhatsApp para el estado dado; si no se manda, no hay botón */
  getWhatsAppUrl?: (status: RequestStatus) => string;
  onClose: () => void;
  onSaved: (status: DecisionStatus) => void;
};

const OPTIONS: {
  value: DecisionStatus;
  title: string;
  description: string;
}[] = [
  {
    value: "APPROVED",
    title: "Aprobar",
    description: "Se acepta la solicitud del cliente.",
  },
  {
    value: "REJECTED",
    title: "Rechazar",
    description: "Se descarta la solicitud del cliente.",
  },
];

export function EditRequestStatusModal({
  requestId,
  currentStatus,
  applicant,
  telefono,
  propertyTitle,
  getWhatsAppUrl,
  onClose,
  onSaved,
}: Props) {
  const { update, loading, error } = useUpdateRequestStatus();
  const [selected, setSelected] = useState<DecisionStatus | null>(null);

  // Cerrar con Escape (no mientras se guarda)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, loading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const ok = await update(requestId, selected);
    if (ok) onSaved(selected);
  };

  return (
    <div
      className="smodal__overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="smodal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="smodal-title"
      >
        <h2 id="smodal-title" className="smodal__title">
          Cambiar estado
        </h2>

        <dl className="smodal__summary">
          <div>
            <dt>Solicitante</dt>
            <dd>{applicant}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{telefono}</dd>
          </div>
          <div>
            <dt>Propiedad</dt>
            <dd>{propertyTitle}</dd>
          </div>
          <div>
            <dt>Estado actual</dt>
            <dd>
              <span
                className={`smodal__status smodal__status--${currentStatus.toLowerCase()}`}
              >
                {REQUEST_STATUS_LABELS[currentStatus]}
              </span>
            </dd>
          </div>
        </dl>

        {getWhatsAppUrl && (
          <div className="smodal__contact">
            <a
              className="smodal__whatsapp"
              href={getWhatsAppUrl(selected ?? currentStatus)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true">💬</span> Enviar mensaje por WhatsApp
            </a>
            <p className="smodal__contact-hint">
              Se abre WhatsApp con un mensaje listo; puedes editarlo antes de
              enviarlo.
            </p>
          </div>
        )}

        {currentStatus !== "PENDING" && (
          <p className="smodal__hint">
            Esta solicitud ya está{" "}
            {REQUEST_STATUS_LABELS[currentStatus].toLowerCase()}. Puedes cambiar
            la decisión.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset className="smodal__options" disabled={loading}>
            <legend className="smodal__legend">Nuevo estado</legend>

            {OPTIONS.map((option) => {
              const isCurrent = option.value === currentStatus;
              const isSelected = selected === option.value;

              return (
                <label
                  key={option.value}
                  className={`smodal__option smodal__option--${option.value.toLowerCase()}${
                    isSelected ? " smodal__option--selected" : ""
                  }${isCurrent ? " smodal__option--disabled" : ""}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={isSelected}
                    disabled={isCurrent}
                    onChange={() => setSelected(option.value)}
                  />
                  <span className="smodal__option-text">
                    <strong>
                      {option.title}
                      {isCurrent && " (estado actual)"}
                    </strong>
                    <small>{option.description}</small>
                  </span>
                </label>
              );
            })}
          </fieldset>

          {error && (
            <p className="smodal__error" role="alert">
              {error}
            </p>
          )}

          <div className="smodal__actions">
            <button
              type="button"
              className="smodal__btn smodal__btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="smodal__btn"
              disabled={loading || !selected}
            >
              {loading ? "Guardando..." : "Guardar cambio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}