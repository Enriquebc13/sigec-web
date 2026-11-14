import type { RequestStatus } from "../../domain/entities/request-history.entity";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

// ⚠️ Ajusta a las acciones que registra tu API; las que no estén aquí
// se muestran tal cual llegan, así que nada se rompe.
const ACTION_LABELS: Record<string, string> = {
  CREATED: "Solicitud creada",
  APPROVED: "Solicitud aprobada",
  REJECTED: "Solicitud rechazada",
};

export const actionLabel = (action: string): string =>
  ACTION_LABELS[action] ?? action;