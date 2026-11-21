import type { ReactNode } from "react";
import { GlowScreen } from "../../../../components/GlowScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";
import { ROLE_LABELS, statusLabel } from "../../domain/entities/users-report.entity";
import { useUsersReports } from "./hooks/use-users-reports";
import "./ReportsShared.css";

type CardProps = {
  title: string;
  description: string;
  busy: boolean;
  disabled: boolean;
  onDownload: () => void;
  children: ReactNode;
};

function ReportCard({
  title,
  description,
  busy,
  disabled,
  onDownload,
  children,
}: CardProps) {
  return (
    <section className="reports__card">
      <div className="reports__card-head">
        <div>
          <h2 className="reports__card-title">{title}</h2>
          <p className="reports__card-text">{description}</p>
        </div>
        <button
          type="button"
          className="reports__download"
          onClick={onDownload}
          disabled={disabled || busy}
        >
          {busy ? "Generando..." : "⬇ Excel"}
        </button>
      </div>
      {children}
    </section>
  );
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function UsersReportsView() {
  const {
    loading,
    error,
    reload,
    list,
    byRole,
    byMonth,
    from,
    to,
    role,
    status,
    setFrom,
    setTo,
    setRole,
    setStatus,
    clearDates,
    rangeError,
    exporting,
    exportError,
    download,
  } = useUsersReports();

  const roleTotal = byRole.reduce((sum, r) => sum + r.total, 0);
  const maxMonthly = Math.max(1, ...byMonth.map((m) => m.count));

  return (
    <GlowScreen wide>
      <RoleNav />

      <section className="reports">
        <div className="reports__heading">
          <div>
            <p className="reports__eyebrow">Administración</p>
            <h1 className="reports__title">Reportes de usuarios</h1>
          </div>
          <button
            type="button"
            className="reports__primary"
            onClick={() => download(["list", "byRole", "byMonth"])}
            disabled={loading || Boolean(error) || Boolean(rangeError) || exporting !== null}
          >
            {exporting === "all" ? "Generando..." : "⬇ Descargar todo (Excel)"}
          </button>
        </div>

        {/* Filtro de fechas: aplica a los tres reportes (fecha de registro) */}
        <div className="reports__filters">
          <label className="reports__field">
            <span>Registrados desde</span>
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
            {/* ---------- Usuarios por rol ---------- */}
            <ReportCard
              title="Usuarios por rol"
              description="Cuántos administradores y cuántos clientes hay."
              busy={exporting === "byRole"}
              disabled={Boolean(rangeError) || exporting !== null}
              onDownload={() => download(["byRole"])}
            >
              <div className="reports__stats">
                {byRole.map((r) => (
                  <div key={r.role} className="reports__stat">
                    <span className="reports__stat-value">{r.total}</span>
                    <span className="reports__stat-label">
                      {ROLE_LABELS[r.role]}s
                    </span>
                  </div>
                ))}
                <div className="reports__stat reports__stat--total">
                  <span className="reports__stat-value">{roleTotal}</span>
                  <span className="reports__stat-label">Total</span>
                </div>
              </div>

              <div className="reports__table-wrapper">
                <table className="reports__table">
                  <thead>
                    <tr>
                      <th>Rol</th>
                      <th>Total</th>
                      <th>Activos</th>
                      <th>Inactivos</th>
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byRole.map((r) => (
                      <tr key={r.role}>
                        <td>{ROLE_LABELS[r.role]}</td>
                        <td>{r.total}</td>
                        <td>{r.active}</td>
                        <td>{r.inactive}</td>
                        <td>{r.percentage.toFixed(1)} %</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportCard>

            {/* ---------- Registros por mes ---------- */}
            <ReportCard
              title="Registros por mes"
              description="Cuántas cuentas se crearon cada mes y cómo crece el total."
              busy={exporting === "byMonth"}
              disabled={Boolean(rangeError) || byMonth.length === 0 || exporting !== null}
              onDownload={() => download(["byMonth"])}
            >
              {byMonth.length === 0 ? (
                <p className="reports__empty">
                  No hay registros en el periodo elegido.
                </p>
              ) : (
                <div className="reports__table-wrapper">
                  <table className="reports__table">
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th>Registros</th>
                        <th className="reports__bar-col" aria-hidden="true" />
                        <th>Acumulado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byMonth.map((m) => (
                        <tr key={m.monthKey}>
                          <td>{m.label}</td>
                          <td>{m.count}</td>
                          <td className="reports__bar-col">
                            <div className="reports__bar">
                              <span
                                style={{ width: `${(m.count / maxMonthly) * 100}%` }}
                              />
                            </div>
                          </td>
                          <td>{m.cumulative}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ReportCard>

            {/* ---------- Listado completo ---------- */}
            <ReportCard
              title="Listado completo de usuarios"
              description="Nombre, correo, rol, estado y fecha de registro."
              busy={exporting === "list"}
              disabled={Boolean(rangeError) || list.length === 0 || exporting !== null}
              onDownload={() => download(["list"])}
            >
              <div className="reports__filters reports__filters--inline">
                <label className="reports__field">
                  <span>Rol</span>
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "ALL" | "ADMIN" | "CLIENT")
                    }
                  >
                    <option value="ALL">Todos</option>
                    <option value="ADMIN">Administradores</option>
                    <option value="CLIENT">Clientes</option>
                  </select>
                </label>
                <label className="reports__field">
                  <span>Estado</span>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
                    }
                  >
                    <option value="ALL">Todos</option>
                    <option value="ACTIVE">Activos</option>
                    <option value="INACTIVE">Inactivos</option>
                  </select>
                </label>
                <p className="reports__count">{list.length} usuarios</p>
              </div>

              {list.length === 0 ? (
                <p className="reports__empty">
                  Ningún usuario coincide con los filtros.
                </p>
              ) : (
                <div className="reports__table-wrapper reports__table-wrapper--scroll">
                  <table className="reports__table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((u) => (
                        <tr key={u.email}>
                          <td className="reports__name">{u.name}</td>
                          <td>{u.email}</td>
                          <td>{ROLE_LABELS[u.role]}</td>
                          <td>
                            <span
                              className={`reports__status${u.active ? " reports__status--active" : ""}`}
                            >
                              {statusLabel(u.active)}
                            </span>
                          </td>
                          <td>{formatDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ReportCard>
          </>
        )}
      </section>
    </GlowScreen>
  );
}