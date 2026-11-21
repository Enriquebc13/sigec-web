import { useMemo } from "react";
import { Link } from "react-router-dom";
import { GlowScreen } from "../../../../components/GlowScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";
import { useProperties } from "../../../properties/presentation/admin/hooks/use-properties";
import { PROPERTY_STATUS_LABELS } from "../../../properties/presentation/admin/property-labels";
import { useMyRequests } from "./hooks/use-my-requests";
import "./MyRequestsView.css";
import "./ClientWaitlistView.css";

const shortDate = (date: Date) =>
  date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/**
 * "Lista de espera" del cliente: su lugar en la fila de cada propiedad donde
 * tiene una solicitud pendiente. Solo ve su propio lugar, nunca a los demás.
 */
export function ClientWaitlistView() {
  const { requests, loading, error, reload } = useMyRequests();
  const { properties, loading: propertiesLoading } = useProperties();

  const propertiesById = useMemo(
    () => new Map(properties.map((p) => [p.id, p])),
    [properties],
  );

  // Solo las pendientes están en la fila; el lugar 1 va primero
  const waiting = useMemo(
    () =>
      requests
        .filter((r) => r.status === "PENDING" && r.posicionListaEspera !== null)
        .sort(
          (a, b) =>
            (a.posicionListaEspera ?? 0) - (b.posicionListaEspera ?? 0),
        ),
    [requests],
  );

  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;

  return (
    <GlowScreen wide>
      <RoleNav />

      <section className="myreq__container">
        <div className="myreq__heading">
          <div>
            <p className="myreq__eyebrow">Seguimiento</p>
            <h1 className="myreq__title">Lista de espera</h1>
          </div>
          <button
            type="button"
            className="myreq__reload"
            onClick={reload}
            disabled={loading}
          >
            Actualizar
          </button>
        </div>

        <p className="wlist__intro">
          Consulta el lugar que ocupas en la fila de cada propiedad que te interesa.
          Si una persona que está delante de ti no continúa con el proceso, avanzarás
          automáticamente. Si la propiedad se renta antes de que llegue tu turno,
          recibirás una notificación mediante los datos de contacto que proporcionaste.

          <br />
          <br />

          Por privacidad, solamente puedes consultar tu propia posición.
        </p>

        {approvedCount > 0 && (
          <p className="myreq__notice" role="status">
            Tienes {approvedCount}{" "}
            {approvedCount === 1
              ? "solicitud aprobada"
              : "solicitudes aprobadas"}
            . Revísalas en{" "}
            <Link to="/client/requests" className="wlist__inline-link">
              Mis solicitudes
            </Link>
            .
          </p>
        )}

        {loading && <p className="myreq__state">Cargando tu lista de espera...</p>}

        {!loading && error && (
          <div className="myreq__state myreq__state--error" role="alert">
            <p>{error}</p>
            <button type="button" className="myreq__reload" onClick={reload}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && waiting.length === 0 && (
          <div className="myreq__state">
            <p>No estás en ninguna lista de espera por ahora.</p>
            <Link to="/client/properties" className="myreq__cta">
              Ver el catálogo
            </Link>
          </div>
        )}

        {!loading && !error && waiting.length > 0 && (
          <ul className="wlist__list">
            {waiting.map((request) => {
              const property = propertiesById.get(request.propertyId);
              const position = request.posicionListaEspera ?? 0;
              const ahead = position - 1;
              const title = property
                ? property.title
                : propertiesLoading
                  ? "…"
                  : "Propiedad no disponible";

              return (
                <li key={request.id} className="wlist__card">
                  <div className="wlist__position" aria-label={`Lugar ${position}`}>
                    <span>Tu lugar</span>
                    <strong>#{position}</strong>
                  </div>

                  <div className="wlist__info">
                    <h3 className="wlist__title" title={title}>
                      {title}
                    </h3>
                    <p className="wlist__meta">
                      {position === 1
                        ? "¡Eres el siguiente! Un administrador te contactará."
                        : `${ahead} ${ahead === 1 ? "persona está" : "personas están"} antes que tú.`}
                    </p>
                    <p className="wlist__meta wlist__meta--muted">
                      {property && (
                        <span
                          className={`wlist__property-status wlist__property-status--${property.status.toLowerCase()}`}
                        >
                          {PROPERTY_STATUS_LABELS[property.status]}
                        </span>
                      )}{" "}
                      Enviada el {shortDate(request.createdAt)}
                    </p>
                    {property?.status === "RESERVED" && (
                      <p className="wlist__meta wlist__meta--muted">
                        Hay un trato en curso. Si no se concreta, avanzarás en
                        la fila.
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/client/properties?property=${request.propertyId}`}
                    className="wlist__link"
                  >
                    Ver propiedad
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </GlowScreen>
  );
}
