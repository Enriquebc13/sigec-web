import type { RequestStatus } from "./request-history.entity";

/** Estados que un admin puede asignar (PENDING lo pone el sistema al crear) */
export type DecisionStatus = "APPROVED" | "REJECTED";

export interface PropertyRequest {
  id: string;
  telefono: string;
  userId: string;
  propertyId: string;
  status: RequestStatus;
  createdAt: Date;
}