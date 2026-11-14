import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import { GetUsersUseCase } from "../../../application/usecases/get-users.use-case";
import type { User } from "../../../domain/entities/user.entity";
import { UserApiRepository } from "../../../infrastructure/repositories/user-api.repository";

const getUsersUseCase = new GetUsersUseCase(new UserApiRepository());

function toMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 403) {
    return "No tienes permisos para ver los usuarios";
  }
  if (err instanceof TypeError) {
    return "No se pudo conectar con el servidor";
  }
  return err instanceof Error ? err.message : "No se pudieron cargar los usuarios";
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getUsersUseCase
      .execute()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err) => {
        if (!cancelled) setError(toMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Evita actualizar el estado si el componente ya se desmontó
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  return { users, loading, error, reload };
}