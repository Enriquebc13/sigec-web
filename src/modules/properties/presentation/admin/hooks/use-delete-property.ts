import { useCallback, useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import { DeletePropertyUseCase } from "../../../application/usecases/delete-property.use-case";
import type { PropertyId } from "../../../domain/entities/property.entity";
import { PropertyApiRepository } from "../../../infrastructure/repositories/property-api.repository";

const deletePropertyUseCase = new DeletePropertyUseCase(
  new PropertyApiRepository(),
);

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return "Solo un administrador puede eliminar propiedades";
    if (err.status === 404) return "La propiedad ya no existe";
    if (err.status >= 500) {
      return "No se pudo eliminar. Revisa que la propiedad no tenga solicitudes asociadas.";
    }
  }
  if (err instanceof TypeError) return "No se pudo conectar con el servidor";
  return err instanceof Error ? err.message : "No se pudo eliminar la propiedad";
}

export function useDeleteProperty() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Devuelve true si se eliminó bien */
  const remove = async (id: PropertyId): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deletePropertyUseCase.execute(id);
      return true;
    } catch (err) {
      setError(toMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /** Limpia el error al abrir o cerrar el diálogo */
  const reset = useCallback(() => setError(null), []);

  return { remove, loading, error, reset };
}