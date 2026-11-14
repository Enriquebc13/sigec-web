import { useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import type { UpdatePropertyDto } from "../../../application/dtos/update-property.dto";
import { UpdatePropertyUseCase } from "../../../application/usecases/update-property.use-case";
import type { PropertyId } from "../../../domain/entities/property.entity";
import { PropertyApiRepository } from "../../../infrastructure/repositories/property-api.repository";

const updatePropertyUseCase = new UpdatePropertyUseCase(
  new PropertyApiRepository(),
);

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return "Solo un administrador puede editar propiedades";
    if (err.status === 404) return "La propiedad ya no existe";
  }
  if (err instanceof TypeError) return "No se pudo conectar con el servidor";
  return err instanceof Error ? err.message : "No se pudo actualizar la propiedad";
}

export function useUpdateProperty() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Devuelve true si se guardó bien */
  const update = async (
    id: PropertyId,
    dto: UpdatePropertyDto,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await updatePropertyUseCase.execute(id, dto);
      return true;
    } catch (err) {
      setError(toMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}