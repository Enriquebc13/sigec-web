import type { RequestStatus } from "../../domain/entities/request-history.entity";

export interface RequestResponseDto {
  id: string;
  telefono: string;
  userId: string;
  propertyId: string;
  status: RequestStatus;
  createdAt: string;
  /** Número si la solicitud está PENDING; null si ya fue resuelta */
  posicionListaEspera?: number | null;
  /** true si el propio solicitante canceló la solicitud */
  cancelledByApplicant?: boolean;
}
