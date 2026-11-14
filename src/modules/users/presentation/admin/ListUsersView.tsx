import { useMemo, useState } from "react";
import { GlowScreen } from "../../../../components/GlowScreen";
import { useAuth } from "../../../auth/presentation/hooks/useAuth";
import type { User } from "../../domain/entities/user.entity";
import { DeleteUserModal } from "./components/DeleteUserModal";
import { EditUserModal } from "./components/EditUserModal";
import { useUsers } from "./hooks/use-users";
import "./ListUsersView.css";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";

const formatDate = (date: Date) =>
  date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function ListUsersView() {
  //NO SE PUEDE BORRAR ASI MISMO/ NO BORRA ADMIN
  const { user: me } = useAuth();
  const { users, loading, error, reload } = useUsers();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
//mostrar lo que se selccione
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "CLIENT">("ALL");

const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();

  return users.filter((u) => {
    const matchesSearch = `${u.name} ${u.lastname} ${u.email}`
      .toLowerCase()
      .includes(q);

    const matchesRole =
      roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });
}, [users, query, roleFilter]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3000);
  };

  const handleSaved = () => {
    setEditing(null);
    showNotice("Usuario actualizado correctamente");
    reload();
  };

  const handleDeleted = () => {
    setDeleting(null);
    showNotice("Usuario eliminado correctamente");
    reload();
  };

  return (
    <GlowScreen wide>

      <RoleNav />
      <section className="users__container">
        <div className="users__heading">
          <div>
            <p className="users__eyebrow">Administración</p>
            <h1 className="users__title">Usuarios</h1>
          </div>
          <button
            type="button"
            className="users__reload"
            onClick={reload}
            disabled={loading}
          >
            Actualizar
          </button>
        </div>

    <div className="users__filters">
  <input
    type="search"
    className="users__search"
    placeholder="Buscar por nombre o correo"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />

  <select
    className="users__role-filter"
    value={roleFilter}
    onChange={(e) =>
      setRoleFilter(e.target.value as "ALL" | "ADMIN" | "CLIENT")
    }
  >
    <option value="ALL">Todos los usuarios</option>
    <option value="ADMIN">Administradores</option>
    <option value="CLIENT">Clientes</option>
  </select>
</div>

        {notice && (
          <p className="users__notice" role="status">
            {notice}
          </p>
        )}

        {loading && <p className="users__state">Cargando usuarios...</p>}

        {!loading && error && (
          <div className="users__state users__state--error" role="alert">
            <p>{error}</p>
            <button type="button" className="users__reload" onClick={reload}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="users__count">
              {filtered.length} de {users.length} usuarios
            </p>

            {filtered.length === 0 ? (
              <p className="users__state">
                {users.length === 0
                  ? "Todavía no hay usuarios registrados."
                  : "Ningún usuario coincide con la búsqueda."}
              </p>
            ) : (
              <div className="users__table-wrapper">
                <table className="users__table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => {
                      const isMe = String(u.id) === me?.id;
                      const isAdmin = u.role === "ADMIN";
                      const canDelete = !isMe && !isAdmin;

                      return (
                        <tr key={u.id}>
                          <td className="users__name">
                            {u.name} {u.lastname}
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <span
                              className={`users__badge users__badge--${u.role.toLowerCase()}`}
                            >
                              {u.role === "ADMIN" ? "Administrador" : "Cliente"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`users__status${u.active ? " users__status--active" : ""}`}
                            >
                              {u.active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td>{formatDate(u.createdAt)}</td>
                          <td>
                            <div className="users__actions">
                              <button
                                type="button"
                                className="users__action"
                                onClick={() => setEditing(u)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="users__action users__action--danger"
                                onClick={() => setDeleting(u)}
                                disabled={!canDelete}
                                title={
                                  isMe
                                    ? "No puedes eliminar tu propia cuenta"
                                    : isAdmin
                                      ? "No puedes eliminar a otro administrador"
                                      : undefined
                                }
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {/* key reinicia el formulario al abrir otro usuario */}
      {editing && (
        <EditUserModal
          key={editing.id}
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <DeleteUserModal
          key={deleting.id}
          user={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={handleDeleted}
        />
      )}
    </GlowScreen>
  );
}