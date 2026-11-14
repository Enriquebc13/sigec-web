import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../../../components/ConfirmDialog";
import { useAuth } from "../../../auth/presentation/hooks/useAuth";
import { useProperties } from "../../../properties/presentation/admin/hooks/use-properties";
import type { PropertyRequest } from "../../domain/entities/request.entity";
import { RequestCard } from "./components/RequestCard";
import { useDeleteRequest } from "./hooks/use-delete-request";
import { useMyRequests } from "./hooks/use-my-requests";
import "./MyRequestsView.css";
import { GlowScreen } from "../../../../components/GlowScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";

// Texto del diálogo según cómo terminó la solicitud
const deleteCopy = {
  APPROVED: (name: string) => ({
    title: "Eliminar solicitud aprobada",
    message: `Tu solicitud para «${name}» fue aprobada. Si la eliminas, desaparecerá de tu lista y no podrás recuperarla. ¿Quieres continuar?`,
  }),
  REJECTED: (name: string) => ({
    title: "Eliminar solicitud rechazada",
    message: `Tu solicitud para «${name}» fue rechazada. ¿Quieres quitarla de tu lista? Esta acción no se puede deshacer.`,
  }),
};

export function MyRequestsView() {
  const { user } = useAuth();
  const { requests, loading, error, reload } = useMyRequests();
  const { properties, loading: propertiesLoading } = useProperties();
  const {
    remove,
    loading: deleting,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteRequest();

  const [toDelete, setToDelete] = useState<{
    request: PropertyRequest;
    name: string;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // id de propiedad → propiedad (de aquí salen el nombre y la imagen)
  const propertiesById = useMemo(
    () => new Map(properties.map((p) => [p.id, p])),
    [properties],
  );

  const askDelete = (request: PropertyRequest, name: string) => {
    resetDelete();
    setToDelete({ request, name });
  };

  const cancelDelete = () => {
    resetDelete();
    setToDelete(null);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { request } = toDelete;
    const ok = await remove(request.id, request.status);
    if (ok) {
      setToDelete(null);
      setNotice("Solicitud eliminada correctamente");
      window.setTimeout(() => setNotice(null), 3000);
      reload();
    }
  };

  // Solo las aprobadas o rechazadas llegan al diálogo
  const copy =
    toDelete && toDelete.request.status !== "PENDING"
      ? deleteCopy[toDelete.request.status](toDelete.name)
      : null;

  return (
    <GlowScreen wide>
      <RoleNav />

      <section className="myreq__container">
        <div className="myreq__heading">
          <div>
            <p className="myreq__eyebrow">Seguimiento</p>
            <h1 className="myreq__title">Mis solicitudes</h1>
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

        {notice && (
          <p className="myreq__notice" role="status">
            {notice}
          </p>
        )}

        {loading && <p className="myreq__state">Cargando tus solicitudes...</p>}

        {!loading && error && (
          <div className="myreq__state myreq__state--error" role="alert">
            <p>{error}</p>
            <button type="button" className="myreq__reload" onClick={reload}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="myreq__state">
            <p>Todavía no has enviado solicitudes.</p>
            <Link to="/client/properties" className="myreq__cta">
              Ver el catálogo
            </Link>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <>
            <p className="myreq__count">
              {requests.length}{" "}
              {requests.length === 1 ? "solicitud" : "solicitudes"}
            </p>

            <div className="myreq__grid">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  property={propertiesById.get(request.propertyId)}
                  propertiesLoading={propertiesLoading}
                  applicant={user?.email}
                  onDelete={askDelete}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {copy && (
        <ConfirmDialog
          title={copy.title}
          message={copy.message}
          confirmLabel="Sí, eliminar"
          cancelLabel="Cancelar"
          danger
          loading={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </GlowScreen>
  );
}