import type { CreateRequestDto } from "../../application/dtos/create-request.dto";
import type { UpdateRequestStatusDto } from "../../application/dtos/update-request-status.dto";
import type {
  AdminPropertyRequest,
  PropertyRequest,
} from "../entities/request.entity";
import type { RequestStatus } from "../entities/request-history.entity";

/** Filtros opcionales del listado de administrador */
export interface RequestFilters {
  propertyId?: string;
  status?: RequestStatus;
}

export interface RequestRepository {
  create(dto: CreateRequestDto): Promise<PropertyRequest>;
  updateStatus(
    id: string,
    dto: UpdateRequestStatusDto,
  ): Promise<PropertyRequest>;
  /** Solicitudes del usuario autenticado */
  findMine(): Promise<PropertyRequest[]>;
  /** Solo ADMIN: todas las solicitudes, con solicitante y propiedad */
  findAll(filters?: RequestFilters): Promise<AdminPropertyRequest[]>;
  /** El solicitante cancela su solicitud pendiente (sale de la lista de espera) */
  cancel(id: string): Promise<PropertyRequest>;
  /** El solicitante corrige su teléfono (solicitud pendiente o aprobada) */
  updatePhone(id: string, telefono: string): Promise<PropertyRequest>;
  /** Elimina una solicitud propia */
  delete(id: string): Promise<void>;
}
