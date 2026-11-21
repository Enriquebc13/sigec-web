import { useCallback, useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import { UpdateRequestPhoneUseCase } from "../../../application/usecases/update-request-phone.use-case";
import type { RequestStatus } from "../../../domain/entities/request-history.entity";
import { RequestApiRepository } from "../../../infrastructure/repositories/request-api.repository";

const updateRequestPhoneUseCase = new UpdateRequestPhoneUseCase(
  new RequestApiRepository(),
);

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return "Esta solicitud no te pertenece";
    if (err.status === 404) return "La solicitud ya no existe";
    if (err.status === 409) return err.message;
  }
  if (err instanceof TypeError) return "No se pudo conectar con el servidor";
  return err instanceof Error ? err.message : "No se pudo actualizar el teléfono";
}

export function useUpdateRequestPhone() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Devuelve true si el teléfono se guardó bien */
  const updatePhone = async (
    id: string,
    status: RequestStatus,
    telefono: string,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await updateRequestPhoneUseCase.execute(id, status, telefono);
      return true;
    } catch (err) {
      setError(toMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => setError(null), []);

  return { updatePhone, loading, error, reset };
}
