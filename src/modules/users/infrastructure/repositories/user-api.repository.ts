import { apiClient } from "../../../../core/http/api-client";
import type { UpdateUserDto } from "../../application/dtos/update-user.dto";
import type { UserDetailResponseDto } from "../../application/dtos/user-detail-response.dto";
import type { User, UserId } from "../../domain/entities/user.entity";
import type { UserRepository } from "../../domain/interfaces/user.repository";

// Convierte lo que manda la API (texto) en la entidad del dominio (Date)
function toUser(dto: UserDetailResponseDto): User {
  return {
    ...dto,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export class UserApiRepository implements UserRepository {

  async findAll(): Promise<User[]> {
    // El apiClient ya manda el token del admin en el header Authorization
    const data = await apiClient<UserDetailResponseDto[]>("/users");
    return data.map(toUser);
  }

    async findById(id: UserId): Promise<User> {
    const data = await apiClient<UserDetailResponseDto>(`/users/${id}`);
    return toUser(data);
  }

    async update(id: UserId, dto: UpdateUserDto): Promise<void> {
    // La respuesta no se usa: después de guardar, la lista se vuelve a pedir
    await apiClient<unknown>(`/users/${id}`, { method: "PATCH", body: dto });
  }

    async delete(id: UserId): Promise<void> {
    await apiClient<unknown>(`/users/${id}`, { method: "DELETE" });
  }
}

