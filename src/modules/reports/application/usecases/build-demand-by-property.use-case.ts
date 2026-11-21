import type { Property } from "../../../properties/domain/entities/property.entity";
import type { AdminPropertyRequest } from "../../../requests/domain/entities/request.entity";
import type { DateRange } from "../../domain/entities/users-report.entity";
import {
  bucketOf,
  emptyCounts,
  type PropertyDemandRow,
} from "../../domain/entities/requests-report.entity";
import { isInRange } from "../date-range";

/**
 * Reporte 3: demanda por propiedad. Incluye TODAS las propiedades (también las
 * que nadie ha solicitado, con total 0) ordenadas de la más a la menos pedida.
 */
export class BuildDemandByPropertyUseCase {
  execute(
    requests: AdminPropertyRequest[],
    properties: Property[],
    range: DateRange,
  ): PropertyDemandRow[] {
    const counts = new Map<string, ReturnType<typeof emptyCounts>>();

    for (const request of requests) {
      if (!isInRange(request.createdAt, range)) continue;
      const current = counts.get(request.propertyId) ?? emptyCounts();
      current[bucketOf(request.status, request.cancelledByApplicant)] += 1;
      counts.set(request.propertyId, current);
    }

    return properties
      .map((property) => {
        const c = counts.get(property.id) ?? emptyCounts();
        return {
          propertyId: property.id,
          title: property.title,
          propertyStatus: property.status,
          ...c,
          total: c.PENDING + c.APPROVED + c.REJECTED + c.CANCELLED,
        };
      })
      .sort((a, b) => b.total - a.total || a.title.localeCompare(b.title, "es"));
  }
}
