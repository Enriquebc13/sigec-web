import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GlowScreen } from "../../../../components/GlowScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";
import { useProperties } from "../../../properties/presentation/admin/hooks/use-properties";
import { PROPERTY_STATUS_LABELS } from "../../../properties/presentation/admin/property-labels";
import type {
  AdminPropertyRequest,
  DecisionStatus,
} from "../../domain/entities/request.entity";
import type { RequestStatus } from "../../domain/entities/request-history.entity";
import { EditRequestStatusModal } from "./components/EditRequestStatusModal";
import { useAdminRequests } from "./hooks/use-admin-requests";
import { REQUEST_STATUS_LABELS, displayStatusLabel } from "./request-labels";
import { buildQueues, emptyQueue } from "./waitlist-utils";
import {
  buildContactMessage,
  buildWhatsAppUrl,
  isWhatsAppReachable,
} from "./whatsapp";
import "./ListRequestHistoryView.css"; // reutiliza encabezado, tabla y estados
import "./AdminWaitlistView.css";

const formatDateTime = (date: Date) =>
  date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Listas de espera del admin: una fila por propiedad con sus solicitudes
 * pendientes ordenadas por puesto, la solicitud aprobada (trato en curso) y
 * el contacto por WhatsApp. Acepta ?property=<id> para abrir una propiedad.
 */
export function AdminWaitlistView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    reload: reloadRequests,
  } = useAdminRequests();
  const {
    properties,
    loading: propertiesLoading,
    error: propertiesError,
    reload: reloadProperties,
  } = useProperties();

  const [editing, setEditing] = useState<AdminPropertyRequest | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loading = requestsLoading || propertiesLoading;
  const error = requestsError ?? propertiesError;

  const queues = useMemo(() => buildQueues(requests), [requests]);

  // Propiedades con más gente esperando primero
  const sortedProperties = useMemo(
    () =>
      [...properties].sort(
        (a, b) =>
          (queues.get(b.id)?.pending.length ?? 0) -
            (queues.get(a.id)?.pending.length ?? 0) ||
          a.title.localeCompare(b.title, "es"),
      ),
    [properties, queues],
  );

  // Propiedad abierta: la de la URL, o la primera de la lista
  const requestedId = searchParams.get("property");
  const selected =
    sortedProperties.find((p) => p.id === requestedId) ?? sortedProperties[0];
  const queue = (selected && queues.get(selected.id)) ?? emptyQueue();

  const selectProperty = (id: string) =>
    setSearchParams({ property: id }, { replace: true });

  const reloadAll = () => {
    reloadRequests();
    reloadProperties();
  };

  const whatsappUrl = (request: AdminPropertyRequest, status: RequestStatus) =>
    buildWhatsAppUrl(
      request.telefono,
      buildContactMessage({
        applicant: request.applicant.name,
        propertyTitle: request.property.title,
        status,
      }),
    );

  const handleSaved = (status: DecisionStatus) => {
    setEditing(null);
    setNotice(
      `Solicitud ${REQUEST_STATUS_LABELS[status].toLowerCase()} correctamente`,
    );
    window.setTimeout(() => setNotice(null), 3000);
    // Aprobar o rechazar también cambia el estado de la propiedad
    reloadAll();
  };

  const renderRow = (request: AdminPropertyRequest, highlight = false) => (
    <tr key={request.id} className={highlight ? "awl__row--next" : undefined}>
      <td>
        {request.posicionListaEspera !== null ? (
          <span className="awl__position">#{request.posicionListaEspera}</span>
        ) : (
          <span className="rhist__muted">—</span>
        )}
      </td>
      <td>
        <span className="rhist__name">
          {request.applicant.name} {request.applicant.lastname}
        </span>
        <span className="rhist__email">{request.applicant.email}</span>
      </td>
      <td>
        {isWhatsAppReachable(request.telefono) ? (
          <a
            className="rhist__phone"
            href={whatsappUrl(request, request.status)}
            target="_blank"
            rel="noopener noreferrer"
            title="Escribir por WhatsApp"
          >
            {request.telefono} <span aria-hidden="true">💬</span>
          </a>
        ) : (
          request.telefono
        )}
      </td>
      <td className="rhist__date">{formatDateTime(request.createdAt)}</td>
      <td>
        <span
          className={`rhist__status rhist__status--${request.status.toLowerCase()}`}
        >
          {displayStatusLabel(request.status, request.cancelledByApplicant)}
        </span>
        {request.status === "APPROVED" &&
          request.property.status === "RENTED" && (
            <span className="awl__rented">🏠 Rentada</span>
          )}
      </td>
      <td>
        <button
          type="button"
          className="rhist__action"
          onClick={() => setEditing(request)}
        >
          Gestionar
        </button>
      </td>
    </tr>
  );

  const tableHead = (
    <thead>
      <tr>
        <th>Lugar</th>
        <th>Solicitante</th>
        <th>Teléfono</th>
        <th>Enviada</th>
        <th>Estado</th>
        <th>Acción</th>
      </tr>
    </thead>
  );

  return (
    <GlowScreen wide className="rhist__page">
      <RoleNav />

      <section className="rhist__container">
        <div className="rhist__heading">
          <div>
            <p className="rhist__eyebrow">Administración</p>
            <h1 className="rhist__title">Listas de espera</h1>
          </div>
          <button
            type="button"
            className="rhist__reload"
            onClick={reloadAll}
            disabled={loading}
          >
            Actualizar
          </button>
        </div>

        {notice && (
          <p className="rhist__notice" role="status">
            {notice}
          </p>
        )}

        {loading && <p className="rhist__state">Cargando listas de espera...</p>}

        {!loading && error && (
          <div className="rhist__state rhist__state--error" role="alert">
            <p>{error}</p>
            <button type="button" className="rhist__reload" onClick={reloadAll}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && sortedProperties.length === 0 && (
          <p className="rhist__state">Todavía no hay propiedades registradas.</p>
        )}

        {!loading && !error && selected && (
          <div className="awl__layout">
            {/* ---------- Propiedades ---------- */}
            <nav className="awl__props" aria-label="Propiedades">
              {sortedProperties.map((property) => {
                const count = queues.get(property.id)?.pending.length ?? 0;
                const active = property.id === selected.id;
                return (
                  <button
                    key={property.id}
                    type="button"
                    className={`awl__prop${active ? " awl__prop--active" : ""}`}
                    aria-pressed={active}
                    onClick={() => selectProperty(property.id)}
                  >
                    <span className="awl__prop-main">
                      <strong title={property.title}>{property.title}</strong>
                      <small>{PROPERTY_STATUS_LABELS[property.status]}</small>
                    </span>
                    <span
                      className={`awl__badge${count > 0 ? " awl__badge--active" : ""}`}
                      title="Solicitudes en espera"
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* ---------- Detalle de la propiedad ---------- */}
            <div className="awl__detail">
              <div className="awl__detail-head">
                <h2 className="awl__detail-title">{selected.title}</h2>
                <span
                  className={`awl__pstatus awl__pstatus--${selected.status.toLowerCase()}`}
                >
                  {PROPERTY_STATUS_LABELS[selected.status]}
                </span>
              </div>
              <p className="awl__summary">
                {queue.pending.length} en espera ·{" "}
                {queue.approved ? "1 aprobada" : "0 aprobadas"} ·{" "}
                {queue.rejectedCount - queue.cancelledCount}{" "}
                {queue.rejectedCount - queue.cancelledCount === 1
                  ? "rechazada"
                  : "rechazadas"}{" "}
                · {queue.cancelledCount}{" "}
                {queue.cancelledCount === 1 ? "cancelada" : "canceladas"}
              </p>

              {queue.approved && (
                <>
                  <h3 className="awl__section">Trato en curso</h3>
                  <div className="rhist__table-wrapper">
                    <table className="rhist__table awl__table">
                      {tableHead}
                      <tbody>{renderRow(queue.approved)}</tbody>
                    </table>
                  </div>
                  <p className="awl__hint">
                    {selected.status === "RENTED"
                      ? "La propiedad ya está rentada a este solicitante. Si pide cancelar el contrato y ya hablaron, cambia la propiedad a «Disponible» desde Propiedades (se te pedirá confirmación)."
                      : "Si el trato se cae, rechaza esta solicitud y la propiedad volverá a «Disponible». Cuando se firme el contrato, cambia la propiedad a «Rentada» desde Propiedades y las demás solicitudes en espera se rechazarán solas."}
                  </p>
                </>
              )}

              <h3 className="awl__section">Lista de espera</h3>
              {queue.pending.length === 0 ? (
                <p className="rhist__state">
                  No hay solicitudes en espera para esta propiedad.
                </p>
              ) : (
                <div className="rhist__table-wrapper">
                  <table className="rhist__table awl__table">
                    {tableHead}
                    <tbody>
                      {queue.pending.map((request, index) =>
                        renderRow(request, index === 0),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {queue.pending.length > 0 && (
                <p className="awl__hint">
                  El lugar #1 es el siguiente a contactar. Al rechazarlo, el
                  lugar #2 pasa a ser el primero.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* key reinicia la selección al abrir otra solicitud */}
      {editing && (
        <EditRequestStatusModal
          key={editing.id}
          requestId={editing.id}
          currentStatus={editing.status}
          applicant={`${editing.applicant.name} ${editing.applicant.lastname}`}
          telefono={editing.telefono}
          propertyTitle={editing.property.title}
          getWhatsAppUrl={
            isWhatsAppReachable(editing.telefono)
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
