import { apiClient } from "../../../../core/http/api-client";
import type { RequestHistoryResponseDto } from "../../application/dtos/request-history-response.dto";
import type { RequestHistory } from "../../domain/entities/request-history.entity";
import type { RequestHistoryRepository } from "../../domain/interfaces/request-history.repository";

// Convierte lo que manda la API (fecha como texto) en la entidad del dominio
function toRequestHistory(dto: RequestHistoryResponseDto): RequestHistory {
  return {
    ...dto,
    changedAt: new Date(dto.changedAt),
  };
}

export class RequestHistoryApiRepository implements RequestHistoryRepository {
  async findAll(): Promise<RequestHistory[]> {
    // Solo ADMIN; el apiClient ya manda el token. La API ordena del más reciente al más antiguo
    const data = await apiClient<RequestHistoryResponseDto[]>(
      "/requests/history",
    );
    return data.map(toRequestHistory);
  }
}