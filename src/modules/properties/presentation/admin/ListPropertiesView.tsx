import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  Property,
  PropertyStatus,
  PropertyType,
} from "../../domain/entities/property.entity";
import { PropertyCard } from "./components/PropertyCard";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "./property-labels";
import "./ListPropertiesView.css";


type Props = {
  properties: Property[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
  /** Contenido al pie de cada tarjeta (opcional) */
  renderAction?: (property: Property) => ReactNode;
  /** Texto cuando todavía no hay propiedades */
  emptyMessage?: string;
   /** Id de una propiedad a la que hay que desplazarse y resaltar */
  highlightId?: string;
};

export function ListPropertiesView({
  properties,
  loading,
  error,
  onReload,
  renderAction,
  emptyMessage = "Todavía no hay propiedades. Crea la primera con «Nueva propiedad».",
  highlightId,
}: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PropertyType | "ALL">("ALL");
  const [status, setStatus] = useState<PropertyStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((p) => {
      if (type !== "ALL" && p.type !== type) return false;
      if (status !== "ALL" && p.status !== status) return false;
      if (!q) return true;
      return `${p.title} ${p.address.street} ${p.address.city} ${p.address.state}`
        .toLowerCase()
        .includes(q);
    });
  }, [properties, query, type, status]);
  useEffect(() => {
    if (!highlightId || loading) return;
    document
      .getElementById(`property-${highlightId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, loading]);

  if (loading) {
    return <p className="plist__state">Cargando propiedades...</p>;
  }

  if (error) {
    return (
      <div className="plist__state plist__state--error" role="alert">
        <p>{error}</p>
        <button type="button" className="plist__retry" onClick={onReload}>
          Reintentar
        </button>
      </div>
    );
  }

   if (properties.length === 0) {
    return <p className="plist__state">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="plist__filters">
        <input
          type="search"
          className="plist__control plist__search"
          placeholder="Buscar por título o dirección"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="plist__control"
          value={type}
          onChange={(e) => setType(e.target.value as PropertyType | "ALL")}
          aria-label="Filtrar por tipo"
        >
          <option value="ALL">Todos los tipos</option>
          {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((t) => (
            <option key={t} value={t}>
              {PROPERTY_TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        <select
          className="plist__control"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as PropertyStatus | "ALL")
          }
          aria-label="Filtrar por estado"
        >
          <option value="ALL">Todos los estados</option>
          {(Object.keys(PROPERTY_STATUS_LABELS) as PropertyStatus[]).map(
            (s) => (
              <option key={s} value={s}>
                {PROPERTY_STATUS_LABELS[s]}
              </option>
            ),
          )}
        </select>
      </div>

      <p className="plist__count">
        {filtered.length} de {properties.length} propiedades
      </p>

      {filtered.length === 0 ? (
        <p className="plist__state">
          Ninguna propiedad coincide con los filtros.
        </p>
      ) : (
                <div className="plist__grid">
          {filtered.map((property) => (
            <div
              key={property.id}
              id={`property-${property.id}`}
              className={`plist__item${
                property.id === highlightId ? " plist__item--highlight" : ""
              }`}
            >
              <PropertyCard
                property={property}
                action={renderAction?.(property)}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}