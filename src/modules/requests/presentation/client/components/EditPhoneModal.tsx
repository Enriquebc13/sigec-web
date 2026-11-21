import { useEffect, useState, type FormEvent } from "react";
import type { PropertyRequest } from "../../../domain/entities/request.entity";
import { useUpdateRequestPhone } from "../hooks/use-update-request-phone";
import "./RequestModal.css";

type Props = {
  request: PropertyRequest;
  propertyTitle: string;
  onClose: () => void;
  /** Se llama en cuanto el teléfono quedó guardado */
  onSaved: () => void;
};

/** Permite corregir el teléfono de una solicitud pendiente o aprobada */
export function EditPhoneModal({
  request,
  propertyTitle,
  onClose,
  onSaved,
}: Props) {
  const { updatePhone, loading, error } = useUpdateRequestPhone();
  const [telefono, setTelefono] = useState(request.telefono);

  const unchanged = telefono.replace(/[\s()-]/g, "") === request.telefono;

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
    const ok = await updatePhone(request.id, request.status, telefono);
    if (ok) onSaved();
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
        aria-labelledby="ephone-title"
      >
        <h2 id="ephone-title" className="rmodal__title">
          Editar teléfono
        </h2>
        <p className="rmodal__text">
          Solicitud para <strong>{propertyTitle}</strong>. Tu lugar en la lista
          de espera no cambia.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="rmodal__label" htmlFor="ephone-input">
            Teléfono de contacto
          </label>
          <input
            id="ephone-input"
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
            <button
              type="submit"
              className="rmodal__btn"
              disabled={loading || unchanged}
            >
              {loading ? "Guardando..." : "Guardar teléfono"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
