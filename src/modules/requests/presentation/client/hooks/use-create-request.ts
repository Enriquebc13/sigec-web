import { useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import type { CreateRequestDto } from "../../../application/dtos/create-request.dto";
import { CreateRequestUseCase } from "../../../application/usecases/create-request.use-case";
import type { PropertyRequest } from "../../../domain/entities/request.entity";
import { RequestApiRepository } from "../../../infrastructure/repositories/request-api.repository";

const createRequestUseCase = new CreateRequestUseCase(
  new RequestApiRepository(),
);

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return "Tu cuenta no puede enviar solicitudes";
    if (err.status === 404) return "La propiedad ya no está disponible";
  }
  if (err instanceof TypeError) return "No se pudo conectar con el servidor";
  return err instanceof Error ? err.message : "No se pudo enviar la solicitud";
}

export function useCreateRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<PropertyRequest | null>(null);

  /** Devuelve true si la solicitud se envió bien */
  const create = async (dto: CreateRequestDto): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      setCreated(await createRequestUseCase.execute(dto));
      return true;
    } catch (err) {
      setError(toMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, created };
}