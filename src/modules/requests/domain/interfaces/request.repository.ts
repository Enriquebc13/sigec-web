import type { CreateRequestDto } from "../../application/dtos/create-request.dto";
import type { UpdateRequestStatusDto } from "../../application/dtos/update-request-status.dto";
import type { PropertyRequest } from "../entities/request.entity";

export interface RequestRepository {
  create(dto: CreateRequestDto): Promise<PropertyRequest>;
  updateStatus(
    id: string,
    dto: UpdateRequestStatusDto,
  ): Promise<PropertyRequest>;
/** Solicitudes del usuario autenticado */
  findMine(): Promise<PropertyRequest[]>;
    /** Elimina una solicitud propia */
  delete(id: string): Promise<void>;
}