import { useEffect, useState } from "react";
import { UserApiRepository } from "../../../infrastructure/repositories/user-api.repository";
import { GetUserUseCase } from "../../../application/usecases/get-user.use-case";
import { ApiError } from "../../../../../core/http/api-client";
import type { User } from "../../../domain/entities/user.entity";

const getUserUseCase = new GetUserUseCase(new UserApiRepository());

function toMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 403) {
    return "Tu cuenta no puede consultar estos datos";
  }
  if (err instanceof TypeError) {
    return "No se pudo conectar con el servidor";
  }
  return err instanceof Error ? err.message : "No se pudieron cargar los datos";
}

/** Datos completos del usuario (nombre, fecha de creación...) por su id */
export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    getUserUseCase
      .execute(userId)
      .then((data) => {
        if (!cancelled) setProfile(data);
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
  }, [userId]);

  return {
    // Si cambió la sesión, no se muestran los datos de la persona anterior
    profile: profile && String(profile.id) === userId ? profile : null,
    loading: Boolean(userId) && loading,
    error,
  };
}