import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import { GetPropertiesUseCase } from "../../../application/usecases/get-properties.use-case";
import type { Property } from "../../../domain/entities/property.entity";
import { PropertyApiRepository } from "../../../infrastructure/repositories/property-api.repository";

const getPropertiesUseCase = new GetPropertiesUseCase(
  new PropertyApiRepository(),
);

function toMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 403) {
    return "No tienes permisos para ver las propiedades";
  }
  if (err instanceof TypeError) {
    return "No se pudo conectar con el servidor";
  }
  return err instanceof Error ? err.message : "No se pudieron cargar las propiedades";
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getPropertiesUseCase
      .execute()
      .then((data) => {
        if (!cancelled) setProperties(data);
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

  return { properties, loading, error, reload };
}