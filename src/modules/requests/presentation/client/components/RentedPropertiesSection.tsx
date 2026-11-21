import { useMemo } from "react";
import { Link } from "react-router-dom";
import { SIGEC_CONTACT } from "../../../../../core/config/contact";
import { useProperties } from "../../../../properties/presentation/admin/hooks/use-properties";
import { useMyRequests } from "../hooks/use-my-requests";
import "./RentedPropertiesSection.css";

/**
 * Propiedades que el cliente tiene rentadas: su solicitud fue aprobada y el
 * admin ya marcó la propiedad como rentada. Incluye cómo cancelar el contrato.
 * No muestra nada si no tiene ninguna.
 */
export function RentedPropertiesSection() {
  const { requests, loading, error } = useMyRequests();
  const { properties } = useProperties();

  const rented = useMemo(() => {
    const byId = new Map(properties.map((p) => [p.id, p]));
    return requests
      .filter((r) => r.status === "APPROVED")
      .map((request) => ({ request, property: byId.get(request.propertyId) }))
      .filter(({ property }) => property?.status === "RENTED");
  }, [requests, properties]);

  if (loading || error || rented.length === 0) return null;

  return (
    <section className="rented" aria-labelledby="rented-title">
      <h2 id="rented-title" className="rented__title">
        Mis propiedades rentadas
      </h2>

      <ul className="rented__list">
        {rented.map(({ request, property }) => (
          <li key={request.id} className="rented__item">
            <div className="rented__head">
              <strong className="rented__name">{property?.title}</strong>
              <span className="rented__badge">🏠 Rentada por ti</span>
            </div>
            <Link
              to={`/client/properties?property=${request.propertyId}`}
              className="rented__link"
            >
              Ver en el catálogo →
            </Link>
          </li>
        ))}
      </ul>

      <div className="rented__note" role="note">
        <p>
          <strong>¿Quieres cancelar el contrato?</strong> Contáctanos y un
          administrador lo gestionará. Mientras no se cancele, la propiedad
          seguirá marcada como rentada por ti.
        </p>
        <p>
          Correo:{" "}
          <a href={`mailto:${SIGEC_CONTACT.email}`}>{SIGEC_CONTACT.email}</a>
          <br />
          Teléfono:{" "}
          <a href={`tel:${SIGEC_CONTACT.phoneHref}`}>{SIGEC_CONTACT.phone}</a>
        </p>
      </div>
    </section>
  );
}
