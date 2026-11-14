import { useEffect } from "react";
import type { User } from "../../../domain/entities/user.entity";
import { useDeleteUser } from "../hooks/use-delete-user";
import "./EditUserModal.css"; // estilos base del modal (overlay, caja, botones)
import "./DeleteUserModal.css";

type Props = {
  user: User;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteUserModal({ user, onClose, onDeleted }: Props) {
  const { remove, loading, error } = useDeleteUser();

  // Cerrar con Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleConfirm = async () => {
    const ok = await remove(user.id);
    if (ok) onDeleted();
  };

  return (
    <div
      className="modal__overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal modal--danger"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        aria-describedby="delete-user-text"
      >
        <h2 id="delete-user-title" className="modal__title">
          Eliminar usuario
        </h2>

        <p id="delete-user-text" className="modal__text">
          ¿Seguro que quieres eliminar a{" "}
          <strong>
            {user.name} {user.lastname}
          </strong>{" "}
          ({user.email})? Esta acción no se puede deshacer.
        </p>

        {error && (
          <p className="modal__error" role="alert">
            {error}
          </p>
        )}

        <div className="modal__actions">
          {/* autoFocus en Cancelar: el valor por defecto es el seguro */}
          <button
            type="button"
            className="modal__btn modal__btn--ghost"
            onClick={onClose}
            disabled={loading}
            autoFocus
          >
            Cancelar
          </button>
          <button
            type="button"
            className="modal__btn modal__btn--danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}