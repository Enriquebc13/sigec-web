import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { GlowScreen } from "../../../../components/GlowScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";
import {
  ALL_PROPERTY_SHEETS,
  STATUS_PLURAL_LABELS,
  TYPE_LABELS,
} from "../../domain/entities/properties-report.entity";
import { usePropertiesReports } from "./hooks/use-properties-reports";
import "./PropertiesReportsView.css";

type CardProps = {
  title: string;
  description: string;
  busy: boolean;
  disabled: boolean;
  onDownload: () => void;
  children: ReactNode;
};

/** Tarjeta de un reporte: título, descripción, botón de Excel y contenido */
function Card({ title, description, busy, disabled, onDownload, children }: CardProps) {
  return (
    <section className="preports__card">
      <div className="preports__card-head">
        <div>
          <h2 className="preports__card-title">{title}</h2>
          <p className="preports__card-text">{description}</p>
        </div>
        <button
          type="button"
          className="preports__download"
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

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const formatDate = (date: Date) =>
  date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function PropertiesReportsView() {
  const {
    loading,
    error,
    reload,
    total,
    inventory,
    rented,
    exporting,
    exportError,
    download,
  } = usePropertiesReports();

  return (
    <GlowScreen wide>
      <RoleNav />

      <section className="preports">
        <Link to="/admin/reports" className="preports__back">
          ← Todos los reportes
        </Link>

        <div className="preports__heading">
          <div>
            <p className="preports__eyebrow">Administración</p>
            <h1 className="preports__title">Reportes de propiedades</h1>
          </div>
          <button
            type="button"
            className="preports__primary"
            onClick={() => download(ALL_PROPERTY_SHEETS)}
            disabled={loading || Boolean(error) || exporting !== null}
          >
            {exporting === "all" ? "Generando..." : "⬇ Descargar todo (Excel)"}
          </button>
        </div>

        <p className="preports__hint">Muestran la situación de hoy de tus propiedades.</p>

        {exportError && (
          <p className="preports__error" role="alert">
            {exportError}
          </p>
        )}

        {loading && <p className="preports__state">Cargando datos...</p>}

        {!loading && error && (
          <div className="preports__state preports__state--error" role="alert">
            <p>{error}</p>
            <button type="button" className="preports__clear" onClick={reload}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ---------- 8. Inventario por estado ---------- */}
            <Card
              title="Inventario por estado"
              description="Cuántas propiedades están disponibles, reservadas, rentadas y no disponibles."
              busy={exporting === "inventory"}
              disabled={total === 0 || exporting !== null}
              onDownload={() => download(["inventory"])}
            >
              <div className="preports__stats">
                {inventory.map((r) => (
                  <div key={r.status} className="preports__stat">
                    <span className="preports__stat-value">{r.count}</span>
                    <span className="preports__stat-label">
                      {STATUS_PLURAL_LABELS[r.status]}
                    </span>
                  </div>
                ))}
                <div className="preports__stat preports__stat--total">
                  <span className="preports__stat-value">{total}</span>
                  <span className="preports__stat-label">Total</span>
                </div>
              </div>

              {total === 0 ? (
                <p className="preports__empty">Todavía no hay propiedades registradas.</p>
              ) : (
                <div className="preports__table-wrapper">
                  <table className="preports__table">
                    <thead>
                      <tr>
                        <th>Estado</th>
                        <th>Propiedades</th>
                        <th className="preports__bar-col" aria-hidden="true" />
                        <th>Porcentaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((r) => (
                        <tr key={r.status}>
                          <td>{STATUS_PLURAL_LABELS[r.status]}</td>
                          <td>{r.count}</td>
                          <td className="preports__bar-col">
                            <div className="preports__bar">
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
            </Card>

            {/* ---------- 9. Propiedades rentadas ---------- */}
            <Card
              title="Propiedades rentadas"
              description="Qué propiedades están rentadas y a quién, con sus datos de contacto."
              busy={exporting === "rented"}
              disabled={rented.length === 0 || exporting !== null}
              onDownload={() => download(["rented"])}
            >
              {rented.length === 0 ? (
                <p className="preports__empty">No hay propiedades rentadas por ahora.</p>
              ) : (
                <div className="preports__table-wrapper preports__table-wrapper--scroll">
                  <table className="preports__table">
                    <thead>
                      <tr>
                        <th>Propiedad</th>
                        <th>Tipo</th>
                        <th>Ciudad</th>
                        <th>Precio</th>
                        <th>Rentada por</th>
                        <th>Teléfono</th>
                        <th>Solicitó el</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rented.map((row) => (
                        <tr key={row.propertyId}>
                          <td className="preports__name">{row.title}</td>
                          <td>{TYPE_LABELS[row.type]}</td>
                          <td>{row.city}</td>
                          <td>{money.format(row.price)}</td>
                          <td>
                            {row.renter ? (
                              <>
                                {row.renter.name}
                                <br />
                                <span className="preports__muted">{row.renter.email}</span>
                              </>
                            ) : (
                              <span className="preports__muted">Sin solicitante registrado</span>
                            )}
                          </td>
                          <td>{row.renter?.telefono ?? "—"}</td>
                          <td>{row.renter ? formatDate(row.renter.requestedAt) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </section>
    </GlowScreen>
  );
}