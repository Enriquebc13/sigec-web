import { apiClient } from "../../../../core/http/api-client";
import type { CreateRequestDto } from "../../application/dtos/create-request.dto";
import type { RequestResponseDto } from "../../application/dtos/request-response.dto";
import type { UpdateRequestStatusDto } from "../../application/dtos/update-request-status.dto";
import type { PropertyRequest } from "../../domain/entities/request.entity";
import type { RequestRepository } from "../../domain/interfaces/request.repository";

function toPropertyRequest(dto: RequestResponseDto): PropertyRequest {
  return { ...dto, createdAt: new Date(dto.createdAt) };
}

export class RequestApiRepository implements RequestRepository {
  async create(dto: CreateRequestDto): Promise<PropertyRequest> {
    // Solo telefono y propertyId: el userId lo saca la API del token
    const data = await apiClient<RequestResponseDto>("/requests", {
      method: "POST",
      body: dto,
    });
    return toPropertyRequest(data);
  }

  async updateStatus(
    id: string,
    dto: UpdateRequestStatusDto,
  ): Promise<PropertyRequest> {
    // Solo ADMIN. La API guarda el cambio en el historial con el admin como autor
    const data = await apiClient<RequestResponseDto>(
      `/requests/${id}/status`,
      { method: "PATCH", body: dto },
    );
    return toPropertyRequest(data);
  }

   async findMine(): Promise<PropertyRequest[]> {
    // La API filtra por el usuario del token
    const data = await apiClient<RequestResponseDto[]>("/requests/my-requests");
    return data.map(toPropertyRequest);
  }
    async delete(id: string): Promise<void> {
    // La API comprueba que la solicitud sea del usuario del token
    await apiClient<unknown>(`/requests/${id}`, { method: "DELETE" });
  }
}