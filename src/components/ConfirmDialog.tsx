import { useEffect } from "react";
import "./ConfirmDialog.css";

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Botón de confirmar en rojo, para acciones destructivas */
  danger?: boolean;
  /** Mientras se ejecuta la acción: bloquea los botones y el cierre */
  loading?: boolean;
  /** Mensaje de error si la acción falló */
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: Props) {
  // Cerrar con Escape (no mientras se procesa)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, loading]);

  return (
    <div
      className="confirm__overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div
        className="confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
      >
        <h2 id="confirm-title" className="confirm__title">
          {title}
        </h2>
        <p id="confirm-text" className="confirm__text">
          {message}
        </p>

        {error && (
          <p className="confirm__error" role="alert">
            {error}
          </p>
        )}

        <div className="confirm__actions">
          {/* autoFocus en cancelar: la opción segura es la predeterminada */}
          <button
            type="button"
            className="confirm__btn confirm__btn--ghost"
            onClick={onCancel}
            disabled={loading}
            autoFocus
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm__btn${danger ? " confirm__btn--danger" : ""}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}