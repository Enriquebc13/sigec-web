export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface PersonSummary {
  name: string;
  lastname: string;
  email: string;
}

export interface RequestSummary {
  id: string;
  telefono: string;
  status: RequestStatus;
  propertyId: string;
  userId: string;
  /** Solicitante: quien mandó la solicitud */
  user: PersonSummary;
}

export interface RequestHistory {
  id: string;
  action: string;
  changedAt: Date;
  requestId: string;
  userId: string;
  /** Quien realizó la acción registrada en este evento */
  user: PersonSummary;
  request: RequestSummary;
}