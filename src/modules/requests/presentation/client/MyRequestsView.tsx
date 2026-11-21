import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../../../components/ConfirmDialog";
import { useAuth } from "../../../auth/presentation/hooks/useAuth";
import { useProperties } from "../../../properties/presentation/admin/hooks/use-properties";
import type { PropertyRequest } from "../../domain/entities/request.entity";
import { EditPhoneModal } from "./components/EditPhoneModal";
import { RequestCard } from "./components/RequestCard";
import { useCancelRequest } from "./hooks/use-cancel-request";
import { useDeleteRequest } from "./hooks/use-delete-request";
import { useMyRequests } from "./hooks/use-my-requests";
import "./MyRequestsView.css";
import { GlowScreen } from "../../../../components/GlowScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";

// Solo las solicitudes rechazadas se pueden eliminar (las aprobadas tienen la
// propiedad reservada y las pendientes ocupan un lugar en la lista de espera)
const deleteCopy = {
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

  const {
    cancel,
    loading: cancelling,
    error: cancelError,
    reset: resetCancel,
  } = useCancelRequest();

  const [toDelete, setToDelete] = useState<{
    request: PropertyRequest;
    name: string;
  } | null>(null);
  const [toCancel, setToCancel] = useState<{
    request: PropertyRequest;
    name: string;
  } | null>(null);
  const [toEditPhone, setToEditPhone] = useState<{
    request: PropertyRequest;
    name: string;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3000);
  };

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
      showNotice("Solicitud eliminada correctamente");
      reload();
    }
  };

  const askCancel = (request: PropertyRequest, name: string) => {
    resetCancel();
    setToCancel({ request, name });
  };

  const dismissCancel = () => {
    resetCancel();
    setToCancel(null);
  };

  const confirmCancel = async () => {
    if (!toCancel) return;
    const { request } = toCancel;
    const ok = await cancel(request.id, request.status);
    if (ok) {
      setToCancel(null);
      showNotice("Solicitud cancelada. Saliste de la lista de espera");
      reload();
    }
  };

  // Solo las rechazadas llegan al diálogo
  const copy =
    toDelete && toDelete.request.status === "REJECTED"
      ? deleteCopy.REJECTED(toDelete.name)
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
                  onCancel={askCancel}
                  onEditPhone={(r, name) => setToEditPhone({ request: r, name })}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {toCancel && (
        <ConfirmDialog
          title="Cancelar solicitud"
          message={`¿Seguro que quieres cancelar tu solicitud para «${toCancel.name}»?${
            toCancel.request.posicionListaEspera !== null
              ? ` Saldrás de la lista de espera (lugar #${toCancel.request.posicionListaEspera}).`
              : ""
          } Si cambias de opinión, tendrás que enviar una nueva solicitud y quedarás al final de la fila.`}
          confirmLabel="Sí, cancelar solicitud"
          cancelLabel="Volver"
          danger
          loading={cancelling}
          error={cancelError}
          onConfirm={confirmCancel}
          onCancel={dismissCancel}
        />
      )}

      {toEditPhone && (
        <EditPhoneModal
          key={toEditPhone.request.id}
          request={toEditPhone.request}
          propertyTitle={toEditPhone.name}
          onClose={() => setToEditPhone(null)}
          onSaved={() => {
            setToEditPhone(null);
            showNotice("Teléfono actualizado correctamente");
            reload();
          }}
        />
      )}

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