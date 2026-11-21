import type { AdminPropertyRequest } from "../../../requests/domain/entities/request.entity";
import type { DateRange } from "../../domain/entities/users-report.entity";
import {
  bucketOf,
  emptyCounts,
  type MonthlyRequestsRow,
} from "../../domain/entities/requests-report.entity";
import { isInRange } from "../date-range";

// Tope de seguridad por si alguien escribe una fecha absurda (año 0001)
const MAX_MONTHS = 600;

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (date: Date) => {
  const text = date.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Reporte 2: solicitudes recibidas cada mes (por fecha de solicitud), con el
 * estado en el que está hoy cada una.
 */
export class BuildRequestsByMonthUseCase {
  execute(requests: AdminPropertyRequest[], range: DateRange): MonthlyRequestsRow[] {
    const inRange = requests.filter((r) => isInRange(r.createdAt, range));

    // Sin datos y sin un rango completo no hay meses que mostrar
    if (inRange.length === 0 && !(range.from && range.to)) return [];

    const times = inRange.map((r) => r.createdAt.getTime());
    const start = range.from ?? new Date(Math.min(...times));
    const end = range.to ?? new Date(Math.max(...times));

    const byMonth = new Map<string, ReturnType<typeof emptyCounts>>();
    for (const request of inRange) {
      const key = monthKey(request.createdAt);
      const counts = byMonth.get(key) ?? emptyCounts();
      counts[bucketOf(request.status, request.cancelledByApplicant)] += 1;
      byMonth.set(key, counts);
    }

    const rows: MonthlyRequestsRow[] = [];
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);

    // Se recorren todos los meses del periodo; los vacíos llevan 0
    while (cursor <= last && rows.length < MAX_MONTHS) {
      const key = monthKey(cursor);
      const counts = byMonth.get(key) ?? emptyCounts();
      rows.push({
        monthKey: key,
        label: monthLabel(cursor),
        ...counts,
        total: counts.PENDING + counts.APPROVED + counts.REJECTED + counts.CANCELLED,
      });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }

    return rows;
  }
}
