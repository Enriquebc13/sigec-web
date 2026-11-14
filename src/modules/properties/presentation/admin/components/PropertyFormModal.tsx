import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useAuth } from "../../../../auth/presentation/hooks/useAuth";
import type { CreatePropertyDto } from "../../../application/dtos/create-property.dto";
import type { PropertyType } from "../../../domain/entities/property.entity";
import { useCreateProperty } from "../hooks/use-create-property";
import { PROPERTY_TYPE_LABELS } from "../property-labels";
import "./PropertyFormModal.css";

type Props = {
  onClose: () => void;
  /** Se llama cuando la propiedad quedó guardada (con o sin imágenes pendientes) */
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
  amenities: string;
  // ⚠️ Dirección: cámbiala según tu AddressDto
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

const initialForm: FormState = {
  title: "",
  description: "",
  price: "",
  maintenanceCost: "",
  dimensions: "",
  floor: "",
  type: "LOCAL",
  amenities: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
};

type Picked = { file: File; preview: string };

export function PropertyFormModal({ onClose, onSaved }: Props) {
  const { user } = useAuth();
  const { status, progress, error, failedFiles, submit, retry } =
    useCreateProperty();

  const [form, setForm] = useState<FormState>(initialForm);
  const [picked, setPicked] = useState<Picked[]>([]);

  // Registro de las URLs de vista previa para liberarlas al cerrar
  const urlsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const urls = urlsRef.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const saving = status === "saving";
  const locked = status !== "idle"; // bloquea los campos una vez que se envió

  // Cerrar con Escape (no mientras se guarda)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving && status !== "partial") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving, status]);

  // Todo guardado: avisa al padre para que cierre y recargue
  useEffect(() => {
    if (status === "done") onSaved();
  }, [status, onSaved]);

  const set =
    (field: keyof FormState) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const added = Array.from(e.target.files ?? []).map((file) => {
      const preview = URL.createObjectURL(file);
      urlsRef.current.add(preview);
      return { file, preview };
    });
    setPicked((prev) => [...prev, ...added]);
    e.target.value = ""; // permite volver a elegir el mismo archivo
  };

  const removePicked = (preview: string) => {
    URL.revokeObjectURL(preview);
    urlsRef.current.delete(preview);
    setPicked((prev) => prev.filter((p) => p.preview !== preview));
  };

  // Arma el body con exactamente los campos del CreatePropertyDto
  const buildDto = (userId: string): CreatePropertyDto => {
    const dto: CreatePropertyDto = {
      title: form.title.trim(),
      price: Number(form.price),
      type: form.type,
      address: {
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
      },
      userId,
    };

    // Los opcionales vacíos NO se mandan
    if (form.description.trim()) dto.description = form.description.trim();
    if (form.maintenanceCost !== "") {
      dto.maintenanceCost = Number(form.maintenanceCost);
    }
    if (form.dimensions.trim()) dto.dimensions = form.dimensions.trim();
    if (form.floor !== "") dto.floor = Number(form.floor);
    if (form.amenities.trim()) dto.amenities = form.amenities.trim();

    return dto;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await submit(
      buildDto(user.id),
      picked.map((p) => p.file),
    );
  };

  return (
    <div
      className="pform__overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving && status !== "partial") {
          onClose();
        }
      }}
    >
      <div
        className="pform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pform-title"
      >
        <h2 id="pform-title" className="pform__title">
          Nueva propiedad
        </h2>

        <form onSubmit={handleSubmit}>
          <fieldset className="pform__fields" disabled={locked}>
            <div className="pform__field">
              <label htmlFor="pf-title">Título *</label>
              <input
                id="pf-title"
                className="pform__input"
                value={form.title}
                onChange={set("title")}
                required
              />
            </div>

            <div className="pform__grid">
              <div className="pform__field">
                <label htmlFor="pf-type">Tipo *</label>
                <select
                  id="pf-type"
                  className="pform__input"
                  value={form.type}
                  onChange={set("type")}
                  required
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
                <label htmlFor="pf-price">Precio *</label>
                <input
                  id="pf-price"
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
                <label htmlFor="pf-maintenance">Costo de mantenimiento</label>
                <input
                  id="pf-maintenance"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pform__input"
                  value={form.maintenanceCost}
                  onChange={set("maintenanceCost")}
                />
              </div>

              <div className="pform__field">
                <label htmlFor="pf-floor">Piso</label>
                <input
                  id="pf-floor"
                  type="number"
                  step="1"
                  className="pform__input"
                  value={form.floor}
                  onChange={set("floor")}
                />
              </div>

              <div className="pform__field">
                <label htmlFor="pf-dimensions">Dimensiones</label>
                <input
                  id="pf-dimensions"
                  className="pform__input"
                  placeholder="Ej. 12 x 8 m"
                  value={form.dimensions}
                  onChange={set("dimensions")}
                />
              </div>

              <div className="pform__field">
                <label htmlFor="pf-amenities">Amenidades</label>
                <input
                  id="pf-amenities"
                  className="pform__input"
                  placeholder="Ej. Estacionamiento, baño, aire acondicionado"
                  value={form.amenities}
                  onChange={set("amenities")}
                />
              </div>
            </div>

            <div className="pform__field">
              <label htmlFor="pf-description">Descripción</label>
              <textarea
                id="pf-description"
                className="pform__input pform__textarea"
                rows={3}
                value={form.description}
                onChange={set("description")}
              />
            </div>

            {/* ⚠️ Dirección: ajusta estos campos a tu AddressDto */}
            <p className="pform__section">Dirección</p>
            <div className="pform__grid">
              <div className="pform__field pform__field--wide">
                <label htmlFor="pf-street">Calle y número *</label>
                <input
                  id="pf-street"
                  className="pform__input"
                  value={form.street}
                  onChange={set("street")}
                  required
                />
              </div>
              <div className="pform__field">
                <label htmlFor="pf-city">Ciudad *</label>
                <input
                  id="pf-city"
                  className="pform__input"
                  value={form.city}
                  onChange={set("city")}
                  required
                />
              </div>
              <div className="pform__field">
                <label htmlFor="pf-state">Estado *</label>
                <input
                  id="pf-state"
                  className="pform__input"
                  value={form.state}
                  onChange={set("state")}
                  required
                />
              </div>
              <div className="pform__field">
                <label htmlFor="pf-zip">Código postal *</label>
                <input
                  id="pf-zip"
                  className="pform__input"
                  value={form.zipCode}
                  onChange={set("zipCode")}
                  required
                />
              </div>
            </div>

            <p className="pform__section">Imágenes</p>
            <label htmlFor="pf-images" className="pform__upload">
              Elegir imágenes
            </label>
            <input
              id="pf-images"
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFiles}
            />
            <p className="pform__help">
              Máximo 8 imágenes de hasta 5 MB. La primera será la portada.
            </p>

            {picked.length > 0 && (
              <ul className="pform__thumbs">
                {picked.map((p, i) => (
                  <li key={p.preview} className="pform__thumb">
                    <img src={p.preview} alt={p.file.name} />
                    {i === 0 && <span className="pform__cover">Portada</span>}
                    <button
                      type="button"
                      className="pform__remove"
                      onClick={() => removePicked(p.preview)}
                      aria-label={`Quitar ${p.file.name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          {error && (
            <p className="pform__error" role="alert">
              {error}
            </p>
          )}

          {saving && (
            <p className="pform__status" role="status">
              {progress && progress.total > 0
                ? `Subiendo imágenes (${progress.done} de ${progress.total})...`
                : "Guardando propiedad..."}
            </p>
          )}

          {status === "partial" && (
            <div className="pform__warning" role="alert">
              <p>
                La propiedad se creó, pero {failedFiles.length}{" "}
                {failedFiles.length === 1
                  ? "imagen no se pudo subir"
                  : "imágenes no se pudieron subir"}
                : {failedFiles.map((f) => f.name).join(", ")}
              </p>
            </div>
          )}

          <div className="pform__actions">
            {status === "partial" ? (
              <>
                <button
                  type="button"
                  className="pform__btn pform__btn--ghost"
                  onClick={onSaved}
                >
                  Cerrar así
                </button>
                <button type="button" className="pform__btn" onClick={retry}>
                  Reintentar imágenes
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="pform__btn pform__btn--ghost"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="pform__btn" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar propiedad"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}