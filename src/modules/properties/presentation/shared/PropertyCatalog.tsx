import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../auth/presentation/hooks/useAuth";
import type { RequestStatus } from "../../../requests/domain/entities/request-history.entity";
import { RequestModal } from "../../../requests/presentation/client/components/RequestModal";
import { useMyRequests } from "../../../requests/presentation/client/hooks/use-my-requests";
import type { Property } from "../../domain/entities/property.entity";
import { useProperties } from "../admin/hooks/use-properties";
import { ListPropertiesView } from "../admin/ListPropertiesView";

/**
 * Catálogo con el botón "Me interesa". Se comporta según quién lo vea:
 * - Visitante: "Me interesa" lo lleva a iniciar sesión y regresa a la propiedad.
 * - Cliente: abre el formulario ahí mismo y el botón refleja el estado de su solicitud.
 * - Admin: no ve el botón.
 */
export function PropertyCatalog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isClient = user?.role === "CLIENT";
  const isAdmin = user?.role === "ADMIN";

  const { properties, loading, error, reload } = useProperties();
  // Solo un cliente tiene solicitudes que consultar
  const {
    requests,
    loading: requestsLoading,
    reload: reloadRequests,
  } = useMyRequests(isClient);

  const [selected, setSelected] = useState<Property | null>(null);
  const [autoOpened, setAutoOpened] = useState(false);

  const focusId = searchParams.get("property") ?? undefined;
  const wantsToRequest = searchParams.get("solicitar") === "1";

  // id de propiedad → estado de su solicitud más reciente (la primera gana)
  const statusByProperty = useMemo(() => {
    const map = new Map<string, RequestStatus>();
    for (const request of requests) {
      if (!map.has(request.propertyId)) {
        map.set(request.propertyId, request.status);
      }
    }
    return map;
  }, [requests]);

  // Si llegó desde "Me interesa" sin sesión, abre el formulario una sola vez
  // cuando ya se conocen las propiedades y las solicitudes del cliente
  if (
    !autoOpened &&
    isClient &&
    wantsToRequest &&
    focusId &&
    !loading &&
    !requestsLoading
  ) {
    const property = properties.find((p) => p.id === focusId);
    const status = statusByProperty.get(focusId);
    setAutoOpened(true);
    if (
      property &&
      property.status === "AVAILABLE" &&
      status !== "PENDING" &&
      status !== "APPROVED"
    ) {
      setSelected(property);
    }
  }

  const handleInterested = (property: Property) => {
    if (!user) {
      // Sin sesión: inicia sesión y regresa a esta propiedad con el formulario abierto
      navigate("/login", {
        state: {
          from: `/client/properties?property=${property.id}&solicitar=1`,
        },
      });
      return;
    }
    setSelected(property);
  };

  const closeModal = () => {
    setSelected(null);
    // Quita "solicitar" de la URL para que no se reabra al recargar
    if (searchParams.has("solicitar")) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("solicitar");
          return next;
        },
        { replace: true },
      );
    }
  };

  const renderAction = (property: Property) => {
    if (isAdmin) return null;

    const requestStatus = isClient
      ? statusByProperty.get(property.id)
      : undefined;
    const available = property.status === "AVAILABLE";

    if (requestStatus === "PENDING") {
      return (
        <button
          type="button"
          className="pcard__btn pcard__btn--pending"
          disabled
        >
          ⏳ Solicitud pendiente
        </button>
      );
    }

    if (requestStatus === "APPROVED") {
      return (
        <button type="button" className="pcard__btn pcard__btn--done" disabled>
          ✓ Solicitud aprobada
        </button>
      );
    }

    if (requestStatus === "REJECTED") {
      return available ? (
        <button
          type="button"
          className="pcard__btn pcard__btn--retry"
          onClick={() => handleInterested(property)}
        >
          Rechazada · Volver a solicitar
        </button>
      ) : (
        <button
          type="button"
          className="pcard__btn pcard__btn--retry"
          disabled
        >
          Solicitud rechazada
        </button>
      );
    }

    if (!available) {
      return (
        <button type="button" className="pcard__btn" disabled>
          No disponible
        </button>
      );
    }

    return (
      <button
        type="button"
        className="pcard__btn"
        onClick={() => handleInterested(property)}
      >
        Me interesa
      </button>
    );
  };

  return (
    <>
      <ListPropertiesView
        properties={properties}
        loading={loading}
        error={error}
        onReload={reload}
        renderAction={renderAction}
        emptyMessage="Por ahora no hay propiedades en el catálogo."
        highlightId={focusId}
      />

      {/* key reinicia el formulario al abrir otra propiedad */}
      {selected && (
        <RequestModal
          key={selected.id}
          propertyId={selected.id}
          propertyTitle={selected.title}
          onClose={closeModal}
          onSent={() => reloadRequests()}
        />
      )}
    </>
  );
}