import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { REQUEST_STATUS_LABELS } from "../../admin/request-labels";
import { useCreateRequest } from "../hooks/use-create-request";
import "./RequestModal.css";

type Props = {
  propertyId: string;
  propertyTitle: string;
  /** La propiedad está reservada: la solicitud entra a la lista de espera */
  joinsWaitlist?: boolean;
  onClose: () => void;
  /** Se llama en cuanto la solicitud se envió, para actualizar las tarjetas */
  onSent: (propertyId: string) => void;
};

export function RequestModal({
  propertyId,
  propertyTitle,
  joinsWaitlist = false,
  onClose,
  onSent,
}: Props) {
  const { create, loading, error, created } = useCreateRequest();
  const [telefono, setTelefono] = useState("");

  // Cerrar con Escape (no mientras se envía)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, loading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await create({ telefono, propertyId });
    if (ok) onSent(propertyId);
  };

  return (
    <div
      className="rmodal__overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="rmodal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rmodal-title"
      >
        {created ? (
          /* ---------- Confirmación ---------- */
          <>
            <div className="rmodal__check" aria-hidden="true">
              ✓
            </div>
            <h2 id="rmodal-title" className="rmodal__title rmodal__title--center">
              ¡Solicitud enviada!
            </h2>
            <p className="rmodal__text rmodal__text--center">
              Un administrador revisará tu solicitud y se pondrá en contacto
              contigo. Puedes ver tu lugar en «Lista de espera».
            </p>

            <dl className="rmodal__summary">
              <div>
                <dt>Propiedad</dt>
                <dd>{propertyTitle}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{created.telefono}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{REQUEST_STATUS_LABELS[created.status]}</dd>
              </div>
              {created.posicionListaEspera !== null && (
                <div>
                  <dt>Lista de espera</dt>
                  <dd>Lugar #{created.posicionListaEspera}</dd>
                </div>
              )}
              <div>
                <dt>Enviada</dt>
                <dd>
                  {created.createdAt.toLocaleString("es-MX", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            </dl>

            <div className="rmodal__actions">
              <button
                type="button"
                className="rmodal__btn rmodal__btn--ghost"
                onClick={onClose}
              >
                Seguir viendo
              </button>
              <Link
                to="/client/requests"
                className="rmodal__btn rmodal__btn--link"
              >
                Ver mis solicitudes
              </Link>
            </div>
          </>
        ) : (
          /* ---------- Formulario ---------- */
          <>
            <h2 id="rmodal-title" className="rmodal__title">
              Me interesa
            </h2>
            <p className="rmodal__text">
              Vas a enviar una solicitud para <strong>{propertyTitle}</strong>.
            </p>
            {joinsWaitlist && (
              <p className="rmodal__hint">
                Esta propiedad está reservada por el momento. Tu solicitud
                entrará a la lista de espera y podrás ver tu lugar en «Lista de
                espera».
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <label className="rmodal__label" htmlFor="rmodal-phone">
                Teléfono de contacto
              </label>
              <input
                id="rmodal-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                className="rmodal__input"
                placeholder="10 dígitos"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                autoFocus
                required
              />
              <p className="rmodal__hint">
                Un administrador te contactará a este número.
              </p>

              {error && (
                <p className="rmodal__error" role="alert">
                  {error}
                </p>
              )}

              <div className="rmodal__actions">
                <button
                  type="button"
                  className="rmodal__btn rmodal__btn--ghost"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="rmodal__btn" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}