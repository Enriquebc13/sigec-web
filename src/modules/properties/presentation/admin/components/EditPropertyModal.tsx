import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { UpdatePropertyDto } from "../../../application/dtos/update-property.dto";
import type {
  Property,
  PropertyStatus,
  PropertyType,
} from "../../../domain/entities/property.entity";
import { useUpdateProperty } from "../hooks/use-update-property";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "../property-labels";
import "./PropertyFormModal.css"; // estilos base del formulario (overlay, campos, botones)

type Props = {
  property: Property;
  onClose: () => void;
  /** Se llama cuando los cambios quedaron guardados */
  onSaved: () => void;
};

type FormState = {
  title: string;
  description: string;
  price: string;
  maintenanceCost: string;
  dimensions: string;
  floor: string;
  type: PropertyType;
  status: PropertyStatus;
  amenities: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

const toForm = (p: Property): FormState => ({
  title: p.title,
  description: p.description ?? "",
  price: String(p.price),
  maintenanceCost: p.maintenanceCost === null ? "" : String(p.maintenanceCost),
  dimensions: p.dimensions ?? "",
  floor: p.floor === null ? "" : String(p.floor),
  type: p.type,
  status: p.status,
  amenities: p.amenities ?? "",
  street: p.address.street,
  city: p.address.city,
  state: p.address.state,
  zipCode: p.address.zipCode,
});

// Solo los campos que cambiaron (la API usa whitelist: nada de campos de más)
function buildChanges(property: Property, form: FormState): UpdatePropertyDto {
  const changes: UpdatePropertyDto = {};

  const title = form.title.trim();
  if (title !== property.title) changes.title = title;

  const description = form.description.trim();
  if (description !== (property.description ?? "")) {
    changes.description = description;
  }

  const price = Number(form.price);
  if (price !== property.price) changes.price = price;

  const maintenanceCost =
    form.maintenanceCost === "" ? null : Number(form.maintenanceCost);
  if (maintenanceCost !== property.maintenanceCost) {
    changes.maintenanceCost = maintenanceCost;
  }

  const dimensions = form.dimensions.trim();
  if (dimensions !== (property.dimensions ?? "")) {
    changes.dimensions = dimensions;
  }

  const floor = form.floor === "" ? null : Number(form.floor);
  if (floor !== property.floor) changes.floor = floor;

  if (form.type !== property.type) changes.type = form.type;
  if (form.status !== property.status) changes.status = form.status;

  const amenities = form.amenities.trim();
  if (amenities !== (property.amenities ?? "")) changes.amenities = amenities;

  // Si cambia cualquier dato de la dirección, se manda la dirección completa
  const address = {
    street: form.street.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    zipCode: form.zipCode.trim(),
  };
  const current = property.address;
  if (
    address.street !== current.street ||
    address.city !== current.city ||
    address.state !== current.state ||
    address.zipCode !== current.zipCode
  ) {
    changes.address = address;
  }

  return changes;
}

export function EditPropertyModal({ property, onClose, onSaved }: Props) {
  const { update, loading, error } = useUpdateProperty();
  const [form, setForm] = useState<FormState>(() => toForm(property));
  const [noChanges, setNoChanges] = useState(false);

  // Cerrar con Escape (no mientras se guarda)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, loading]);

  const set =
    (field: keyof FormState) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNoChanges(false);

    const changes = buildChanges(property, form);
    if (Object.keys(changes).length === 0) {
      setNoChanges(true);
      return;
    }

    const ok = await update(property.id, changes);
    if (ok) onSaved();
  };

  const message = noChanges ? "No hiciste ningún cambio" : error;

  return (
    <div
      className="pform__overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="pform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-property-title"
      >
        <h2 id="edit-property-title" className="pform__title">
          Editar propiedad
        </h2>

        <form onSubmit={handleSubmit}>
          <fieldset className="pform__fields" disabled={loading}>
            <div className="pform__field">
              <label htmlFor="ep-title">Título *</label>
              <input
                id="ep-title"
                className="pform__input"
                value={form.title}
                onChange={set("title")}
                required
              />
            </div>

            <div className="pform__grid">
              <div className="pform__field">
                <label htmlFor="ep-type">Tipo *</label>
                <select
                  id="ep-type"
                  className="pform__input"
                  value={form.type}
                  onChange={set("type")}
                >
                  {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map(
                    (type) => (
                      <option key={type} value={type}>
                        {PROPERTY_TYPE_LABELS[type]}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="pform__field">
                <label htmlFor="ep-status">Estado *</label>
                <select
                  id="ep-status"
                  className="pform__input"
                  value={form.status}
                  onChange={set("status")}
                >
                  {(
                    Object.keys(PROPERTY_STATUS_LABELS) as PropertyStatus[]
                  ).map((status) => (
                    <option key={status} value={status}>
                      {PROPERTY_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pform__field">
                <label htmlFor="ep-price">Precio *</label>
                <input
                  id="ep-price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pform__input"
                  value={form.price}
                  onChange={set("price")}
                  required
                />
              </div>

              <div className="pform__field">
                <label htmlFor="ep-maintenance">Costo de mantenimiento</label>
                <input
                  id="ep-maintenance"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pform__input"
                  value={form.maintenanceCost}
                  onChange={set("maintenanceCost")}
                />
              </div>

              <div className="pform__field">
                <label htmlFor="ep-floor">Piso</label>
                <input
                  id="ep-floor"
                  type="number"
                  step="1"
                  className="pform__input"
                  value={form.floor}
                  onChange={set("floor")}
                />
              </div>

              <div className="pform__field">
                <label htmlFor="ep-dimensions">Dimensiones</label>
                <input
                  id="ep-dimensions"
                  className="pform__input"
                  value={form.dimensions}
                  onChange={set("dimensions")}
                />
              </div>
            </div>

            <div className="pform__field">
              <label htmlFor="ep-amenities">Amenidades</label>
              <input
                id="ep-amenities"
                className="pform__input"
                value={form.amenities}
                onChange={set("amenities")}
              />
            </div>

            <div className="pform__field">
              <label htmlFor="ep-description">Descripción</label>
              <textarea
                id="ep-description"
                className="pform__input pform__textarea"
                rows={3}
                value={form.description}
                onChange={set("description")}
              />
            </div>

            <p className="pform__section">Dirección</p>
            <div className="pform__grid">
              <div className="pform__field pform__field--wide">
                <label htmlFor="ep-street">Calle y número *</label>
                <input
                  id="ep-street"
                  className="pform__input"
                  value={form.street}
                  onChange={set("street")}
                  required
                />
              </div>
              <div className="pform__field">
                <label htmlFor="ep-city">Ciudad *</label>
                <input
                  id="ep-city"
                  className="pform__input"
                  value={form.city}
                  onChange={set("city")}
                  required
                />
              </div>
              <div className="pform__field">
                <label htmlFor="ep-state">Estado *</label>
                <input
                  id="ep-state"
                  className="pform__input"
                  value={form.state}
                  onChange={set("state")}
                  required
                />
              </div>
              <div className="pform__field">
                <label htmlFor="ep-zip">Código postal *</label>
                <input
                  id="ep-zip"
                  className="pform__input"
                  value={form.zipCode}
                  onChange={set("zipCode")}
                  required
                />
              </div>
            </div>
          </fieldset>

          {message && (
            <p className="pform__error" role="alert">
              {message}
            </p>
          )}

          <div className="pform__actions">
            <button
              type="button"
              className="pform__btn pform__btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="pform__btn" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}