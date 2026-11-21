import { apiClient } from "../../../../core/http/api-client";
import type { AdminRequestResponseDto } from "../../application/dtos/admin-request-response.dto";
import type { CreateRequestDto } from "../../application/dtos/create-request.dto";
import type { RequestResponseDto } from "../../application/dtos/request-response.dto";
import type { UpdateRequestStatusDto } from "../../application/dtos/update-request-status.dto";
import type {
  AdminPropertyRequest,
  PropertyRequest,
} from "../../domain/entities/request.entity";
import type {
  RequestFilters,
  RequestRepository,
} from "../../domain/interfaces/request.repository";

function toPropertyRequest(dto: RequestResponseDto): PropertyRequest {
  return {
    ...dto,
    createdAt: new Date(dto.createdAt),
    // La API manda null (o nada) cuando la solicitud ya no está pendiente
    posicionListaEspera: dto.posicionListaEspera ?? null,
    cancelledByApplicant: dto.cancelledByApplicant ?? false,
  };
}

function toAdminRequest(dto: AdminRequestResponseDto): AdminPropertyRequest {
  return {
    ...toPropertyRequest(dto),
    applicant: dto.applicant,
    property: dto.property,
  };
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
    // La API filtra por el usuario del token y calcula posicionListaEspera
    const data = await apiClient<RequestResponseDto[]>("/requests/my-requests");
    return data.map(toPropertyRequest);
  }

  async findAll(filters: RequestFilters = {}): Promise<AdminPropertyRequest[]> {
    // Solo ADMIN. propertyId y status son opcionales
    const params = new URLSearchParams();
    if (filters.propertyId) params.set("propertyId", filters.propertyId);
    if (filters.status) params.set("status", filters.status);
    const query = params.toString();

    const data = await apiClient<AdminRequestResponseDto[]>(
      `/requests${query ? `?${query}` : ""}`,
    );
    return data.map(toAdminRequest);
  }

  async cancel(id: string): Promise<PropertyRequest> {
    // La API comprueba que sea del usuario del token y que siga PENDING
    const data = await apiClient<RequestResponseDto>(`/requests/${id}/cancel`, {
      method: "PATCH",
    });
    return toPropertyRequest(data);
  }

  async updatePhone(id: string, telefono: string): Promise<PropertyRequest> {
    const data = await apiClient<RequestResponseDto>(`/requests/${id}/phone`, {
      method: "PATCH",
      body: { telefono },
    });
    return toPropertyRequest(data);
  }

  async delete(id: string): Promise<void> {
    // La API comprueba que la solicitud sea del usuario del token
    await apiClient<unknown>(`/requests/${id}`, { method: "DELETE" });
  }
}
