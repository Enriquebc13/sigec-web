import type { AdminPropertyRequest } from "../../../requests/domain/entities/request.entity";
import type { DateRange } from "../../domain/entities/users-report.entity";
import {
  BUCKET_ORDER,
  bucketOf,
  emptyCounts,
  type StatusSummaryRow,
} from "../../domain/entities/requests-report.entity";
import { isInRange } from "../date-range";

/** Reporte 1: cuántas solicitudes hay en cada estado (por fecha de solicitud) */
export class BuildRequestsByStatusUseCase {
  execute(requests: AdminPropertyRequest[], range: DateRange): StatusSummaryRow[] {
    const counts = emptyCounts();
    let total = 0;

    for (const request of requests) {
      if (!isInRange(request.createdAt, range)) continue;
      counts[bucketOf(request.status, request.cancelledByApplicant)] += 1;
      total += 1;
    }

    return BUCKET_ORDER.map((bucket) => ({
      bucket,
      count: counts[bucket],
      percentage: total === 0 ? 0 : (counts[bucket] / total) * 100,
    }));
  }
}
