import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import { GetRequestHistoryUseCase } from "../../../application/usecases/get-request-history.use-case";
import type { RequestHistory } from "../../../domain/entities/request-history.entity";
import { RequestHistoryApiRepository } from "../../../infrastructure/repositories/request-history-api.repository";

const getRequestHistoryUseCase = new GetRequestHistoryUseCase(
  new RequestHistoryApiRepository(),
);

function toMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 403) {
    return "No tienes permisos para ver el historial de solicitudes";
  }
  if (err instanceof TypeError) {
    return "No se pudo conectar con el servidor";
  }
  return err instanceof Error ? err.message : "No se pudo cargar el historial";
}

export function useRequestHistory() {
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getRequestHistoryUseCase
      .execute()
      .then((data) => {
        if (!cancelled) setHistory(data);
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

  return { history, loading, error, reload };
}