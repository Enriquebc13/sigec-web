import type { User } from "../../../users/domain/entities/user.entity";
import type {
  DateRange,
  MonthlyRegistrationRow,
} from "../../domain/entities/users-report.entity";
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

export class BuildRegistrationsByMonthUseCase {
  execute(users: User[], range: DateRange): MonthlyRegistrationRow[] {
    const inRange = users.filter((u) => isInRange(u.createdAt, range));

    // Sin datos y sin un rango completo no hay meses que mostrar
    if (inRange.length === 0 && !(range.from && range.to)) return [];

    const times = inRange.map((u) => u.createdAt.getTime());
    // Límites: el rango pedido o, si falta un extremo, el primer/último registro
    const start = range.from ?? new Date(Math.min(...times));
    const end = range.to ?? new Date(Math.max(...times));

    const counts = new Map<string, number>();
    for (const user of inRange) {
      const key = monthKey(user.createdAt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const rows: MonthlyRegistrationRow[] = [];
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    let cumulative = 0;

    // Se recorren todos los meses del periodo; los que no tienen altas llevan 0
    while (cursor <= last && rows.length < MAX_MONTHS) {
      const count = counts.get(monthKey(cursor)) ?? 0;
      cumulative += count;
      rows.push({
        monthKey: monthKey(cursor),
        label: monthLabel(cursor),
        count,
        cumulative,
      });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }

    return rows;
  }
}