import { Link } from "react-router-dom";
import { GlowScreen } from "../../../../components/GlowScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";
import {
  ALL_REQUEST_SHEETS,
  BUCKET_LABELS,
  PROPERTY_STATUS_LABELS,
} from "../../domain/entities/requests-report.entity";
import { ReportCard } from "./components/ReportCard";
import { useRequestsReports } from "./hooks/use-requests-reports";

import "./ReportsShared.css";
import "./RequestsReportsView.css";

const formatDate = (date: Date) =>
  date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function RequestsReportsView() {
  const {
    loading,
    error,
    reload,
    properties,
    byStatus,
    byMonth,
    demand,
    waitlists,
    from,
    to,
    setFrom,
    setTo,
    clearDates,
    rangeError,
    waitlistPropertyId,
    setWaitlistPropertyId,
    exporting,
    exportError,
    download,
  } = useRequestsReports();

  const total = byStatus.reduce((sum, r) => sum + r.count, 0);
  const maxMonthly = Math.max(1, ...byMonth.map((m) => m.total));
  const maxDemand = Math.max(1, ...demand.map((d) => d.total));
  const waitingTotal = waitlists.reduce((sum, g) => sum + g.entries.length, 0);

  return (
    <GlowScreen wide>
      <RoleNav />

      <section className="reports">
        <Link to="/admin/reports" className="rr__back">
          ← Todos los reportes
        </Link>

        <div className="reports__heading">
          <div>
            <p className="reports__eyebrow">Administración</p>
            <h1 className="reports__title">Reportes de solicitudes</h1>
          </div>
          <button
            type="button"
            className="reports__primary"
            onClick={() => download(ALL_REQUEST_SHEETS)}
            disabled={loading || Boolean(error) || Boolean(rangeError) || exporting !== null}
          >
            {exporting === "all" ? "Generando..." : "⬇ Descargar todo (Excel)"}
          </button>
        </div>

        {/* Filtro de fechas: aplica a los reportes 1, 2 y 3 (fecha de la solicitud) */}
        <div className="reports__filters">
          <label className="reports__field">
            <span>Solicitadas desde</span>
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="reports__field">
            <span>Hasta</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="reports__clear"
            onClick={clearDates}
            disabled={!from && !to}
          >
            Limpiar fechas
          </button>
        </div>
        <p className="rr__hint">
          Las fechas aplican a los primeros tres reportes. Las listas de espera
          muestran siempre la situación de hoy.
        </p>

        {rangeError && (
          <p className="reports__error" role="alert">
            {rangeError}
          </p>
        )}
        {exportError && (
          <p className="reports__error" role="alert">
            {exportError}
          </p>
        )}

        {loading && <p className="reports__state">Cargando datos...</p>}

        {!loading && error && (
          <div className="reports__state reports__state--error" role="alert">
            <p>{error}</p>
            <button type="button" className="reports__clear" onClick={reload}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ---------- 1. Solicitudes por estado ---------- */}
            <ReportCard
              title="Solicitudes por estado"
              description="Cuántas solicitudes están pendientes, aprobadas, rechazadas y canceladas por el propio cliente."
              busy={exporting === "byStatus"}
              disabled={Boolean(rangeError) || exporting !== null}
              onDownload={() => download(["byStatus"])}
            >
              <div className="reports__stats">
                {byStatus.map((r) => (
                  <div key={r.bucket} className="reports__stat">
                    <span className="reports__stat-value">{r.count}</span>
                    <span className="reports__stat-label">
                      {BUCKET_LABELS[r.bucket]}
                    </span>
                  </div>
                ))}
                <div className="reports__stat reports__stat--total">
                  <span className="reports__stat-value">{total}</span>
                  <span className="reports__stat-label">Total</span>
                </div>
              </div>

              {total === 0 ? (
                <p className="reports__empty">
                  No hay solicitudes en el periodo elegido.
                </p>
              ) : (
                <div className="reports__table-wrapper">
                  <table className="reports__table">
                    <thead>
                      <tr>
                        <th>Estado</th>
                        <th>Solicitudes</th>
                        <th className="reports__bar-col" aria-hidden="true" />
                        <th>Porcentaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byStatus.map((r) => (
                        <tr key={r.bucket}>
                          <td>{BUCKET_LABELS[r.bucket]}</td>
                          <td>{r.count}</td>
                          <td className="reports__bar-col">
                            <div className="reports__bar">
                              <span style={{ width: `${r.percentage}%` }} />
                            </div>
                          </td>
                          <td>{r.percentage.toFixed(1)} %</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ReportCard>

            {/* ---------- 2. Solicitudes por mes ---------- */}
            <ReportCard
              title="Solicitudes por mes"
              description="Cuántas solicitudes llegaron cada mes y en qué estado están hoy."
              busy={exporting === "byMonth"}
              disabled={Boolean(rangeError) || byMonth.length === 0 || exporting !== null}
              onDownload={() => download(["byMonth"])}
            >
              {byMonth.length === 0 ? (
                <p className="reports__empty">
                  No hay solicitudes en el periodo elegido.
                </p>
              ) : (
                <div className="reports__table-wrapper">
                  <table className="reports__table">
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th>Total</th>
                        <th className="reports__bar-col" aria-hidden="true" />
                        <th>Pendientes</th>
                        <th>Aprobadas</th>
                        <th>Rechazadas</th>
                        <th>Canceladas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byMonth.map((m) => (
                        <tr key={m.monthKey}>
                          <td>{m.label}</td>
                          <td>{m.total}</td>
                          <td className="reports__bar-col">
                            <div className="reports__bar">
                              <span
                                style={{ width: `${(m.total / maxMonthly) * 100}%` }}
                              />
                            </div>
                          </td>
                          <td>{m.PENDING}</td>
                          <td>{m.APPROVED}</td>
                          <td>{m.REJECTED}</td>
                          <td>{m.CANCELLED}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ReportCard>

            {/* ---------- 3. Demanda por propiedad ---------- */}
            <ReportCard
              title="Demanda por propiedad"
              description="Cuántas solicitudes ha recibido cada propiedad y cuántas siguen en espera. Las propiedades sin solicitudes aparecen con 0."
              busy={exporting === "demand"}
              disabled={Boolean(rangeError) || demand.length === 0 || exporting !== null}
              onDownload={() => download(["demand"])}
            >
              {demand.length === 0 ? (
                <p className="reports__empty">Todavía no hay propiedades registradas.</p>
              ) : (
                <div className="reports__table-wrapper reports__table-wrapper--scroll">
                  <table className="reports__table">
                    <thead>
                      <tr>
                        <th>Propiedad</th>
                        <th>Estado</th>
                        <th>Solicitudes</th>
                        <th className="reports__bar-col" aria-hidden="true" />
                        <th>En espera</th>
                        <th>Aprobadas</th>
                        <th>Rechazadas</th>
                        <th>Canceladas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demand.map((d) => (
                        <tr key={d.propertyId}>
                          <td className="reports__name">{d.title}</td>
                          <td>{PROPERTY_STATUS_LABELS[d.propertyStatus]}</td>
                          <td>{d.total}</td>
                          <td className="reports__bar-col">
                            <div className="reports__bar">
                              <span
                                style={{ width: `${(d.total / maxDemand) * 100}%` }}
                              />
                            </div>
                          </td>
                          <td>{d.PENDING}</td>
                          <td>{d.APPROVED}</td>
                          <td>{d.REJECTED}</td>
                          <td>{d.CANCELLED}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ReportCard>

            {/* ---------- 4. Listas de espera actuales ---------- */}
            <ReportCard
              title="Listas de espera actuales"
              description="Por propiedad, quién va en cada puesto con su teléfono y fecha de solicitud, para poder contactarlos."
              busy={exporting === "waitlists"}
              disabled={waitlists.length === 0 || exporting !== null}
              onDownload={() => download(["waitlists"])}
            >
              <div className="reports__filters reports__filters--inline">
                <label className="reports__field">
                  <span>Propiedad</span>
                  <select
                    value={waitlistPropertyId}
                    onChange={(e) => setWaitlistPropertyId(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="reports__count">
                  {waitingTotal} {waitingTotal === 1 ? "persona" : "personas"} en espera
                </p>
              </div>

              {waitlists.length === 0 ? (
                <p className="reports__empty">
                  No hay listas de espera activas ni tratos en curso.
                </p>
              ) : (
                waitlists.map((group) => (
                  <div key={group.propertyId} className="rr__group">
                    <div className="rr__group-head">
                      <h3 className="rr__group-title">{group.title}</h3>
                      <span className="rr__tag">
                        {PROPERTY_STATUS_LABELS[group.propertyStatus]}
                      </span>
                      <span className="rr__muted">
                        {group.entries.length} en espera
                      </span>
                    </div>

                    {group.inProgress && (
                      <p className="rr__progress">
                        🤝 Trato en curso con <strong>{group.inProgress}</strong>
                      </p>
                    )}

                    {group.entries.length === 0 ? (
                      <p className="rr__muted">Nadie más está en espera.</p>
                    ) : (
                      <div className="reports__table-wrapper">
                        <table className="reports__table">
                          <thead>
                            <tr>
                              <th>Puesto</th>
                              <th>Nombre</th>
                              <th>Correo</th>
                              <th>Teléfono</th>
                              <th>Solicitó el</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.entries.map((entry) => (
                              <tr key={`${group.propertyId}-${entry.position}-${entry.email}`}>
                                <td>#{entry.position}</td>
                                <td className="reports__name">{entry.name}</td>
                                <td>{entry.email}</td>
                                <td>{entry.telefono}</td>
                                <td>{formatDate(entry.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              )}
            </ReportCard>
          </>
        )}
      </section>
    </GlowScreen>
  );
}
