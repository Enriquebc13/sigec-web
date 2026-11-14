import { useEffect, useState, type FormEvent } from "react";
import type { UpdateUserDto } from "../../../application/dtos/update-user.dto";
import type { User } from "../../../domain/entities/user.entity";
import { useUpdateUser } from "../hooks/use-update-user";
import "./EditUserModal.css";

type Props = {
  user: User;
  onClose: () => void;
  onSaved: () => void;
};

export function EditUserModal({ user, onClose, onSaved }: Props) {
  const { update, loading, error } = useUpdateUser();
  const [name, setName] = useState(user.name);
  const [lastname, setLastname] = useState(user.lastname);
  const [email, setEmail] = useState(user.email);
  const [noChanges, setNoChanges] = useState(false);

  // Cerrar con Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNoChanges(false);

    // Solo se mandan los campos que cambiaron
    const changes: UpdateUserDto = {};
    if (name.trim() !== user.name) changes.name = name.trim();
    if (lastname.trim() !== user.lastname) changes.lastname = lastname.trim();
    if (email.trim() !== user.email) changes.email = email.trim();

    if (Object.keys(changes).length === 0) {
      setNoChanges(true);
      return;
    }

    const ok = await update(user.id, changes);
    if (ok) onSaved();
  };

  const message = noChanges ? "No hiciste ningún cambio" : error;

  return (
    <div
      className="modal__overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
      >
        <h2 id="edit-user-title" className="modal__title">
          Editar usuario
        </h2>
        <p className="modal__hint">
          {user.role === "ADMIN" ? "Administrador" : "Cliente"} · registrado el{" "}
          {user.createdAt.toLocaleDateString("es-MX")}
        </p>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="modal__label" htmlFor="edit-name">
            Nombre
          </label>
          <input
            id="edit-name"
            type="text"
            className="modal__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />

          <label className="modal__label" htmlFor="edit-lastname">
            Apellido
          </label>
          <input
            id="edit-lastname"
            type="text"
            className="modal__input"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
          />

          <label className="modal__label" htmlFor="edit-email">
            Correo electrónico
          </label>
          <input
            id="edit-email"
            type="email"
            className="modal__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {message && (
            <p className="modal__error" role="alert">
              {message}
            </p>
          )}

          <div className="modal__actions">
            <button
              type="button"
              className="modal__btn modal__btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="modal__btn" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}