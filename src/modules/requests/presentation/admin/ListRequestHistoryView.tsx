import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GlowScreen } from "../../../../components/GlowScreen";
import { useProperties } from "../../../properties/presentation/admin/hooks/use-properties";
import type { DecisionStatus } from "../../domain/entities/request.entity";
import type {
  RequestHistory,
  RequestStatus,
} from "../../domain/entities/request-history.entity";
import { EditRequestStatusModal } from "./components/EditRequestStatusModal";
import { useRequestHistory } from "./hooks/use-request-history";
import { REQUEST_STATUS_LABELS, actionLabel, displayStatusLabel } from "./request-labels";
import {
  buildContactMessage,
  buildWhatsAppUrl,
  isWhatsAppReachable,
} from "./whatsapp";
import "./ListRequestHistoryView.css";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";

// Minúsculas y sin acentos: "José" coincide con "jose"
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const formatDateTime = (date: Date) =>
  date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function ListRequestHistoryView() {
  const { history, loading, error, reload } = useRequestHistory();
  const { properties, loading: propertiesLoading } = useProperties();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  >("ALL");
  const [editing, setEditing] = useState<RequestHistory | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // id de propiedad → título
  const propertyTitles = useMemo(
    () => new Map(properties.map((p) => [p.id, p.title])),
    [properties],
  );

  // id de propiedad → estado (para marcar las solicitudes aprobadas ya rentadas)
  const propertyStatuses = useMemo(
    () => new Map(properties.map((p) => [p.id, p.status])),
    [properties],
  );

  const propertyLabel = (propertyId: string) => {
    const title = propertyTitles.get(propertyId);
    if (title) return title;
    return propertiesLoading ? "…" : "Propiedad no disponible";
  };

  // Enlace de WhatsApp con un mensaje según el estado de la solicitud
  const whatsappUrl = (h: RequestHistory, status: RequestStatus) =>
    buildWhatsAppUrl(
      h.request.telefono,
      buildContactMessage({
        applicant: h.request.user.name,
        propertyTitle: propertyTitles.get(h.request.propertyId),
        status,
      }),
    );

  // Una solicitud sale en varias filas (un evento por cambio). El botón de
  // editar solo va en el evento más reciente de cada solicitud.
  const latestEventIds = useMemo(() => {
    const latest = new Map<string, RequestHistory>();
    for (const h of history) {
      const current = latest.get(h.requestId);
      if (!current || h.changedAt > current.changedAt) {
        latest.set(h.requestId, h);
      }
    }
    return new Set([...latest.values()].map((h) => h.id));
  }, [history]);

  // Solicitudes que canceló su propio dueño: su último rechazo lo registró él
  const cancelledRequestIds = useMemo(() => {
    const lastRejection = new Map<string, RequestHistory>();
    for (const h of history) {
      if (h.action !== "REJECTED") continue;
      const current = lastRejection.get(h.requestId);
      if (!current || h.changedAt > current.changedAt) {
        lastRejection.set(h.requestId, h);
      }
    }
    return new Set(
      [...lastRejection.values()]
        .filter(
          (h) => h.request.status === "REJECTED" && h.userId === h.request.userId,
        )
        .map((h) => h.requestId),
    );
  }, [history]);

  // Filtra por estado y por el solicitante (nombre, apellido o correo)
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return history.filter((h) => {
      const cancelled = cancelledRequestIds.has(h.requestId);
      const status = h.request.status;

      if (statusFilter === "CANCELLED" && !cancelled) return false;
      if (statusFilter === "REJECTED" && (status !== "REJECTED" || cancelled))
        return false;
      if (
        (statusFilter === "PENDING" || statusFilter === "APPROVED") &&
        status !== statusFilter
      )
        return false;

      if (!q) return true;
      const { name, lastname, email } = h.request.user;
      return normalize(`${name} ${lastname} ${email}`).includes(q);
    });
  }, [history, query, statusFilter, cancelledRequestIds]);

  const handleSaved = (status: DecisionStatus) => {
    setEditing(null);
    setNotice(
      `Solicitud ${REQUEST_STATUS_LABELS[status].toLowerCase()} correctamente`,
    );
    window.setTimeout(() => setNotice(null), 3000);
    reload(); // el cambio aparece como un evento nuevo arriba del historial
  };

  return (
    <GlowScreen wide className="rhist__page">
      <RoleNav />

      <section className="rhist__container">
        <div className="rhist__heading">
          <div>
            <p className="rhist__eyebrow">Historial</p>
            <h1 className="rhist__title">Solicitudes</h1>
          </div>
          <button
            type="button"
            className="rhist__reload"
            onClick={reload}
            disabled={loading}
          >
            Actualizar
          </button>
        </div>

        <input
          type="search"
          className="rhist__search"
          placeholder="Buscar por nombre del solicitante"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="rhist__filters" role="group" aria-label="Filtrar por estado">
          {(
            [
              ["ALL", "Todas"],
              ["PENDING", "Pendientes"],
              ["APPROVED", "Aprobadas"],
              ["REJECTED", "Rechazadas"],
              ["CANCELLED", "Canceladas"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`rhist__chip${statusFilter === value ? " rhist__chip--active" : ""}`}
              onClick={() => setStatusFilter(value)}
              aria-pressed={statusFilter === value}
            >
              {label}
            </button>
          ))}
        </div>
        {notice && (
          <p className="rhist__notice" role="status">
            {notice}
          </p>
        )}

        {loading && <p className="rhist__state">Cargando historial...</p>}

        {!loading && error && (
          <div className="rhist__state rhist__state--error" role="alert">
            <p>{error}</p>
            <button type="button" className="rhist__reload" onClick={reload}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="rhist__count">
              {filtered.length} de {history.length} registros
            </p>

            {filtered.length === 0 ? (
              <p className="rhist__state">
                {history.length === 0
                  ? "Todavía no hay solicitudes registradas."
                  : "Ningún registro coincide con los filtros."}
              </p>
            ) : (
              <div className="rhist__table-wrapper">
                <table className="rhist__table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Solicitante</th>
                      <th>Teléfono</th>
                      <th>Propiedad</th>
                      <th>Estado</th>
                      <th>Acción</th>
                      <th>Realizada por</th>
                      <th>Editar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((h) => (
                      <tr key={h.id}>
                        <td className="rhist__date">
                          {formatDateTime(h.changedAt)}
                        </td>
                        <td>
                          <span className="rhist__name">
                            {h.request.user.name} {h.request.user.lastname}
                          </span>
                          <span className="rhist__email">
                            {h.request.user.email}
                          </span>
                        </td>
                        <td>
                          {isWhatsAppReachable(h.request.telefono) ? (
                            <a
                              className="rhist__phone"
                              href={whatsappUrl(h, h.request.status)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Escribir por WhatsApp"
                            >
                              {h.request.telefono}{" "}
                              <span aria-hidden="true">💬</span>
                            </a>
                          ) : (
                            h.request.telefono
                          )}
                        </td>
                        <td className="rhist__property">
                          {propertyLabel(h.request.propertyId)}
                        </td>
                        <td>
                          <div className="rhist__status-group">
                            <span className={`rhist__status rhist__status--${h.request.status.toLowerCase()}`}>
                              {displayStatusLabel(h.request.status, cancelledRequestIds.has(h.requestId))}
                            </span>
                            {h.request.status === "APPROVED" &&
                              propertyStatuses.get(h.request.propertyId) === "RENTED" && (
                                <span className="rhist__status rhist__status--rented">
                                 Rentada
                                </span>
                              )}
                          </div>
                        </td>
                        <td>
                          {h.action === "REJECTED" && h.userId === h.request.userId
                            ? "Solicitud cancelada por el solicitante"
                            : actionLabel(h.action)}
                        </td>
                        <td>
                          {h.user.name} {h.user.lastname}
                        </td>
                        <td>
                          {h.request.status === "APPROVED" &&
                            propertyStatuses.get(h.request.propertyId) ===
                            "RENTED" ? (
                            <Link
                              to="/admin/properties"
                              className="rhist__action"
                              title="Está rentada: para terminar el contrato, pon la propiedad en Disponible"
                            >
                              Ir a Propiedades
                            </Link>
                          ) : latestEventIds.has(h.id) &&
                            h.request.status !== "REJECTED" ? (
                            <button
                              type="button"
                              className="rhist__action"
                              onClick={() => setEditing(h)}
                            >
                              Cambiar estado
                            </button>
                          ) : (
                            <span
                              className="rhist__muted"
                              title={
                                h.request.status === "REJECTED"
                                  ? "Una solicitud rechazada no se puede reabrir"
                                  : "Se edita desde el evento más reciente de la solicitud"
                              }
                            >
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {/* key reinicia la selección al abrir otra solicitud */}
      {editing && (
        <EditRequestStatusModal
          key={editing.requestId}
          requestId={editing.requestId}
          currentStatus={editing.request.status}
          applicant={`${editing.request.user.name} ${editing.request.user.lastname}`}
          telefono={editing.request.telefono}
          propertyTitle={propertyLabel(editing.request.propertyId)}
          getWhatsAppUrl={
            isWhatsAppReachable(editing.request.telefono)
              ? (status) => whatsappUrl(editing, status)
              : undefined
          }
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </GlowScreen>
  );
}