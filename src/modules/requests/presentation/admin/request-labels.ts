import type { RequestStatus } from "../../domain/entities/request-history.entity";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

/**
 * Etiqueta para mostrar: una solicitud rechazada por su propio dueño se
 * muestra como "Cancelada" (la API no tiene un estado aparte para eso).
 */
export const displayStatusLabel = (
  status: RequestStatus,
  cancelledByApplicant = false,
): string =>
  status === "REJECTED" && cancelledByApplicant
    ? "Cancelada"
    : REQUEST_STATUS_LABELS[status];

// ⚠️ Ajusta a las acciones que registra tu API; las que no estén aquí
// se muestran tal cual llegan, así que nada se rompe.
const ACTION_LABELS: Record<string, string> = {
  CREATED: "Solicitud creada",
  APPROVED: "Solicitud aprobada",
  REJECTED: "Solicitud rechazada",
  UPDATED: "Datos actualizados",
};

export const actionLabel = (action: string): string =>
  ACTION_LABELS[action] ?? action;