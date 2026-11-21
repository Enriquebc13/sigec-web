import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../../../components/ConfirmDialog";
import { GlowScreen } from "../../../../components/GlowScreen";
import type {
  AutoRejectedRequest,
  Property,
} from "../../domain/entities/property.entity";
import { AutoRejectedNotice } from "../../../requests/presentation/admin/components/AutoRejectedNotice";
import { useAdminRequests } from "../../../requests/presentation/admin/hooks/use-admin-requests";
import { buildQueues } from "../../../requests/presentation/admin/waitlist-utils";
import { EditPropertyModal } from "./components/EditPropertyModal";
import { PropertyFormModal } from "./components/PropertyFormModal";
import { useDeleteProperty } from "./hooks/use-delete-property";
import { useProperties } from "./hooks/use-properties";
import { ListPropertiesView } from "./ListPropertiesView";
import "./PropertiesView.css";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";

export function PropertiesView() {
  const { properties, loading, error, reload } = useProperties();
  const {
    remove,
    loading: deleting,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteProperty();

  // Solicitudes de todas las propiedades, para mostrar cuántas esperan en cada una
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    reload: reloadRequests,
  } = useAdminRequests();
  const queues = useMemo(() => buildQueues(requests), [requests]);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [toDelete, setToDelete] = useState<Property | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // Solicitudes que la API rechazó sola al cambiar el estado de la propiedad
  const [autoRejected, setAutoRejected] = useState<AutoRejectedRequest[]>([]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3000);
  };

  const handleCreated = () => {
    setCreating(false);
    showNotice("Propiedad guardada correctamente");
    reload();
  };

  const handleUpdated = (rejected: AutoRejectedRequest[]) => {
    setEditing(null);
    setAutoRejected(rejected);
    showNotice("Propiedad actualizada correctamente");
    reload();
    reloadRequests(); // el cambio de estado pudo rechazar solicitudes
  };

  const askDelete = (property: Property) => {
    resetDelete();
    setToDelete(property);
  };

  const cancelDelete = () => {
    resetDelete();
    setToDelete(null);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const ok = await remove(toDelete.id);
    if (ok) {
      setToDelete(null);
      showNotice("Propiedad eliminada correctamente");
      reload();
    }
  };

  // Botones al pie de cada tarjeta
  const renderAction = (property: Property) => {
    const waiting = queues.get(property.id)?.pending.length ?? 0;
    const showCount = !requestsLoading && !requestsError;
    const renter =
      property.status === "RENTED" ? queues.get(property.id)?.approved : null;

    return (
      <>
        {renter && (
          <p className="pcard__renter">
            🏠 Rentada por {renter.applicant.name} {renter.applicant.lastname}
          </p>
        )}
        <Link
          to={`/admin/waitlist?property=${property.id}`}
          className="pcard__btn pcard__btn--link"
        >
          Lista de espera{showCount ? ` · ${waiting} en espera` : ""}
        </Link>
        <div className="pcard__actions">
          <button
            type="button"
            className="pcard__btn pcard__btn--ghost"
            onClick={() => setEditing(property)}
          >
            Editar
          </button>
          <button
            type="button"
            className="pcard__btn pcard__btn--danger"
            onClick={() => askDelete(property)}
          >
            Eliminar
          </button>
        </div>
      </>
    );
  };

  return (
    <GlowScreen wide>
    <RoleNav />

      <section className="properties__container">
        <div className="properties__heading">
          <div>
            <p className="properties__eyebrow">Administración</p>
            <h1 className="properties__title">Propiedades</h1>
          </div>
          <button
            type="button"
            className="properties__new"
            onClick={() => setCreating(true)}
          >
            + Nueva propiedad
          </button>
        </div>

        {notice && (
          <p className="properties__notice" role="status">
            {notice}
          </p>
        )}

        <AutoRejectedNotice
          rejected={autoRejected}
          onDismiss={() => setAutoRejected([])}
        />

        <ListPropertiesView
          properties={properties}
          loading={loading}
          error={error}
          onReload={reload}
          renderAction={renderAction}
        />
      </section>

      {creating && (
        <PropertyFormModal
          onClose={() => setCreating(false)}
          onSaved={handleCreated}
        />
      )}

      {/* key reinicia el formulario al editar otra propiedad */}
      {editing && (
        <EditPropertyModal
          key={editing.id}
          property={editing}
          onClose={() => setEditing(null)}
          onSaved={handleUpdated}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar propiedad"
          message={`¿Seguro que quieres eliminar «${toDelete.title}»? También se borrarán sus imágenes. Esta acción no se puede deshacer.`}
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