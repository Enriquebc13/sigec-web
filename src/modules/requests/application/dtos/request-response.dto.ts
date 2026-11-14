import type { RequestStatus } from "../../domain/entities/request-history.entity";

export interface RequestResponseDto {
  id: string;
  telefono: string;
  userId: string;
  propertyId: string;
  status: RequestStatus;
  createdAt: string;
}