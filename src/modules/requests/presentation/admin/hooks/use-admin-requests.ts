import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import { GetAdminRequestsUseCase } from "../../../application/usecases/get-admin-requests.use-case";
import type { AdminPropertyRequest } from "../../../domain/entities/request.entity";
import { RequestApiRepository } from "../../../infrastructure/repositories/request-api.repository";

const getAdminRequestsUseCase = new GetAdminRequestsUseCase(
  new RequestApiRepository(),
);

function toMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 403) {
    return "No tienes permisos para ver las solicitudes";
  }
  if (err instanceof TypeError) {
    return "No se pudo conectar con el servidor";
  }
  return err instanceof Error ? err.message : "No se pudieron cargar las solicitudes";
}

/** Todas las solicitudes (solo ADMIN), de la más antigua a la más reciente */
export function useAdminRequests() {
  const [requests, setRequests] = useState<AdminPropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getAdminRequestsUseCase
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
  }, [reloadKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  return { requests, loading, error, reload };
}
