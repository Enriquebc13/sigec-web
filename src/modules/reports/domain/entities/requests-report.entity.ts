import type { PropertyStatus } from "../../../properties/domain/entities/property.entity";
import type { RequestStatus } from "../../../requests/domain/entities/request-history.entity";

/**
 * Grupos del reporte "Solicitudes por estado". "Cancelada" no es un estado de
 * la API: es una solicitud REJECTED que canceló el propio solicitante.
 */
export type RequestBucket = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export const BUCKET_ORDER: RequestBucket[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

export const BUCKET_LABELS: Record<RequestBucket, string> = {
  PENDING: "Pendientes",
  APPROVED: "Aprobadas",
  REJECTED: "Rechazadas",
  CANCELLED: "Canceladas",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservada",
  RENTED: "Rentada",
  UNAVAILABLE: "No disponible",
};

export function bucketOf(
  status: RequestStatus,
  cancelledByApplicant: boolean,
): RequestBucket {
  if (status === "REJECTED") return cancelledByApplicant ? "CANCELLED" : "REJECTED";
  return status;
}

/** Conteo de solicitudes por grupo de estado */
export type BucketCounts = Record<RequestBucket, number>;

export const emptyCounts = (): BucketCounts => ({
  PENDING: 0,
  APPROVED: 0,
  REJECTED: 0,
  CANCELLED: 0,
});

/** Una fila del reporte "Solicitudes por estado" */
export interface StatusSummaryRow {
  bucket: RequestBucket;
  count: number;
  /** 0 a 100 */
  percentage: number;
}

/** Una fila del reporte "Solicitudes por mes" */
export interface MonthlyRequestsRow extends BucketCounts {
  monthKey: string; // "2026-11"
  label: string; // "Noviembre 2026"
  total: number;
}

/** Una fila del reporte "Demanda por propiedad" */
export interface PropertyDemandRow extends BucketCounts {
  propertyId: string;
  title: string;
  propertyStatus: PropertyStatus;
  total: number;
}

/** Una persona dentro de una lista de espera */
export interface WaitlistEntryRow {
  position: number;
  name: string;
  email: string;
  telefono: string;
  createdAt: Date;
}

/** Lista de espera de una propiedad */
export interface PropertyWaitlist {
  propertyId: string;
  title: string;
  propertyStatus: PropertyStatus;
  /** Nombre de quien tiene el trato en curso (solicitud aprobada), si hay */
  inProgress: string | null;
  entries: WaitlistEntryRow[];
}

export interface RequestsReportBundle {
  byStatus: StatusSummaryRow[];
  byMonth: MonthlyRequestsRow[];
  demand: PropertyDemandRow[];
  waitlists: PropertyWaitlist[];
  /** Texto del filtro de fechas, por ejemplo "01/11/2026 – 30/11/2026" */
  rangeLabel: string;
}

export type RequestsReportSheet = "byStatus" | "byMonth" | "demand" | "waitlists";

export const ALL_REQUEST_SHEETS: RequestsReportSheet[] = [
  "byStatus",
  "byMonth",
  "demand",
  "waitlists",
];
