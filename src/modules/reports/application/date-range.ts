import type { DateRange } from "../domain/entities/users-report.entity";

/** "2026-11-01" (de un input date) → rango en hora local, de las 00:00 a las 23:59 */
export function parseRange(from: string, to: string): DateRange {
  return {
    from: from ? new Date(`${from}T00:00:00`) : undefined,
    to: to ? new Date(`${to}T23:59:59.999`) : undefined,
  };
}

export function isInRange(date: Date, range: DateRange): boolean {
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
}