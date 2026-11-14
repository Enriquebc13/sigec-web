import { useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import type { UpdateUserDto } from "../../../application/dtos/update-user.dto";
import { UpdateUserUseCase } from "../../../application/usecases/update-user.use-case";
import type { UserId } from "../../../domain/entities/user.entity";
import { UserApiRepository } from "../../../infrastructure/repositories/user-api.repository";

const updateUserUseCase = new UpdateUserUseCase(new UserApiRepository());

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return "Ese correo ya está en uso";
    if (err.status === 403) return "No tienes permisos para editar usuarios";
    if (err.status === 404) return "El usuario ya no existe";
  }
  if (err instanceof TypeError) return "No se pudo conectar con el servidor";
  return err instanceof Error ? err.message : "No se pudo actualizar el usuario";
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Devuelve true si se guardó bien */
  const update = async (id: UserId, dto: UpdateUserDto): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await updateUserUseCase.execute(id, dto);
      return true;
    } catch (err) {
      setError(toMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}