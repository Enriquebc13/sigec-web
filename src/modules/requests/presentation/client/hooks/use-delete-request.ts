import { useCallback, useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import { DeleteRequestUseCase } from "../../../application/usecases/delete-request.use-case";
import type { RequestStatus } from "../../../domain/entities/request-history.entity";
import { RequestApiRepository } from "../../../infrastructure/repositories/request-api.repository";

const deleteRequestUseCase = new DeleteRequestUseCase(
  new RequestApiRepository(),
);

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return "Esta solicitud no te pertenece";
    if (err.status === 404) return "La solicitud ya no existe";
  }
  if (err instanceof TypeError) return "No se pudo conectar con el servidor";
  return err instanceof Error ? err.message : "No se pudo eliminar la solicitud";
}

export function useDeleteRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Devuelve true si la solicitud se eliminó bien */
  const remove = async (
    id: string,
    status: RequestStatus,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteRequestUseCase.execute(id, status);
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