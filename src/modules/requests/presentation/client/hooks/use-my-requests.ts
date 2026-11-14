import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import { GetMyRequestsUseCase } from "../../../application/usecases/get-my-requests.use-case";
import type { PropertyRequest } from "../../../domain/entities/request.entity";
import { RequestApiRepository } from "../../../infrastructure/repositories/request-api.repository";

const getMyRequestsUseCase = new GetMyRequestsUseCase(
  new RequestApiRepository(),
);

function toMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 403) {
    return "Tu cuenta no puede consultar solicitudes";
  }
  if (err instanceof TypeError) {
    return "No se pudo conectar con el servidor";
  }
  return err instanceof Error ? err.message : "No se pudieron cargar tus solicitudes";
}

/** enabled=false: no pide nada (por ejemplo, si no hay sesión de cliente) */
export function useMyRequests(enabled = true) {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    getMyRequestsUseCase
      .execute()
      .then((data) => {
        if (!cancelled) setRequests(data);
      })
      .catch((err) => {
        if (!cancelled) setError(toMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, enabled]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  // Deshabilitado: no se devuelve nada de una sesión anterior
  return {
    requests: enabled ? requests : [],
    loading: enabled && loading,
    error: enabled ? error : null,
    reload,
  };
}