import { useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import { DeleteUserUseCase } from "../../../application/usecases/delete-user.use-case";
import type { UserId } from "../../../domain/entities/user.entity";
import { UserApiRepository } from "../../../infrastructure/repositories/user-api.repository";

const deleteUserUseCase = new DeleteUserUseCase(new UserApiRepository());

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return "No tienes permisos para eliminar usuarios";
    if (err.status === 404) return "El usuario ya no existe";
    if (err.status === 409) {
      return "No se puede eliminar porque tiene información asociada";
    }
  }
  if (err instanceof TypeError) return "No se pudo conectar con el servidor";
  return err instanceof Error ? err.message : "No se pudo eliminar el usuario";
}

export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Devuelve true si se eliminó bien */
  const remove = async (id: UserId): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteUserUseCase.execute(id);
      return true;
    } catch (err) {
      setError(toMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
}