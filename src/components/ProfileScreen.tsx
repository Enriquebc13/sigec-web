import { useState, type ReactNode } from "react";
import { Avatar } from "./Avatar";
import { ConfirmDialog } from "./ConfirmDialog";
import { GlowScreen } from "./GlowScreen";
import "./ProfileScreen.css";

type Props = {
  /** Barra de navegación de la pantalla (por ejemplo, <RoleNav />) */
  nav?: ReactNode;
  title: string;
  subtitle?: string;
  roleLabel: string;
  email?: string;
  userId?: string;
  onSignOut: () => void;
  /** Datos que vienen de GET /users/:id */
  fullName?: string;
  memberSince?: Date;
  /** Cuándo vence la sesión (sale del token) */
  sessionExpiresAt?: Date | null;
  detailsLoading?: boolean;
  detailsError?: string | null;
  /** Contenido extra debajo de los datos de la cuenta (por ejemplo, propiedades rentadas) */
  extra?: ReactNode;
};

const dateOnly = (date: Date) =>
  date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const dateTime = (date: Date) =>
  date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Tiempo que falta, calculado al abrir la pantalla (no se actualiza solo)
function timeLeft(date: Date, now: number): string {
  const ms = date.getTime() - now;
  if (ms <= 0) return "vencida";
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  return hours >= 1
    ? `en ${hours} h ${minutes % 60} min`
    : `en ${minutes} min`;
}

export function ProfileScreen({
  nav,
  title,
  subtitle,
  roleLabel,
  email,
  userId,
  onSignOut,
  fullName,
  memberSince,
  sessionExpiresAt,
  detailsLoading = false,
  detailsError = null,
  extra,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  // Date.now() en el inicializador: se calcula una sola vez al montar
  const [now] = useState(() => Date.now());

  const showMemberSince = memberSince !== undefined || detailsLoading;

  return (
    <GlowScreen wide>
      {nav}

      <section className="profile">
        <h1 className="profile__title">{title}</h1>
        {subtitle && <p className="profile__subtitle">{subtitle}</p>}

        <div className="profile__layout">
          {/* Columna izquierda: avatar, nombre y correo */}
          <div className="profile__identity">
            <Avatar margin={0} />
            {(fullName || detailsLoading) && (
              <h2 className="profile__name">{fullName ?? "Cargando..."}</h2>
            )}
            <p className="profile__email">{email}</p>
          </div>

          {/* Columna derecha: datos y cierre de sesión */}
          <div className="profile__details">
            <dl className="profile__card">
              <div className="profile__row">
                <dt>Rol</dt>
                <dd>
                  <span className="profile__badge">{roleLabel}</span>
                </dd>
              </div>

              {showMemberSince && (
                <div className="profile__row">
                  <dt>Miembro desde</dt>
                  <dd>{memberSince ? dateOnly(memberSince) : "…"}</dd>
                </div>
              )}

              {sessionExpiresAt && (
                <div className="profile__row">
                  <dt>La sesión vence</dt>
                  <dd>
                    {dateTime(sessionExpiresAt)}
                    <small>{timeLeft(sessionExpiresAt, now)}</small>
                  </dd>
                </div>
              )}

              {userId && (
                <div className="profile__row">
                  <dt>ID de usuario</dt>
                  <dd>{userId}</dd>
                </div>
              )}
            </dl>

            {detailsError && (
              <p className="profile__note">
                No se pudieron cargar algunos datos de la cuenta.
              </p>
            )}

            <button
              type="button"
              className="profile__logout"
              onClick={() => setConfirming(true)}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {extra}
      </section>

      {confirming && (
        <ConfirmDialog
          title="Cerrar sesión"
          message="¿Estás seguro de que quieres salir?"
          confirmLabel="Cerrar sesión"
          danger
          onConfirm={onSignOut}
          onCancel={() => setConfirming(false)}
        />
      )}
    </GlowScreen>
  );
}