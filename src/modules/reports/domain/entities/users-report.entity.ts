import type { UserRole } from "../../../users/domain/entities/user.entity";

export interface DateRange {
  from?: Date;
  to?: Date;
}

/** Una fila del listado completo de usuarios */
export interface UserReportRow {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
}

/** Una fila del reporte "Usuarios por rol" */
export interface RoleSummaryRow {
  role: UserRole;
  total: number;
  active: number;
  inactive: number;
  /** 0 a 100 */
  percentage: number;
}

/** Una fila del reporte "Registros por mes" */
export interface MonthlyRegistrationRow {
  monthKey: string; // "2026-11"
  label: string; // "Noviembre 2026"
  count: number;
  /** Suma de registros desde el primer mes del periodo */
  cumulative: number;
}

export interface UsersReportBundle {
  list: UserReportRow[];
  byRole: RoleSummaryRow[];
  byMonth: MonthlyRegistrationRow[];
  /** Texto del filtro de fechas, por ejemplo "01/11/2026 – 30/11/2026" */
  rangeLabel: string;
}

export type UsersReportSheet = "list" | "byRole" | "byMonth";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  CLIENT: "Cliente",
};

export const statusLabel = (active: boolean) =>
  active ? "Activo" : "Inactivo";