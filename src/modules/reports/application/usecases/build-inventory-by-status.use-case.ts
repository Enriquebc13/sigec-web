import type { Property } from "../../../properties/domain/entities/property.entity";
import {
  STATUS_ORDER,
  type InventoryStatusRow,
} from "../../domain/entities/properties-report.entity";

/** Reporte 8: cuántas propiedades hay en cada estado */
export class BuildInventoryByStatusUseCase {
  execute(properties: Property[]): InventoryStatusRow[] {
    const total = properties.length;

    return STATUS_ORDER.map((status) => {
      const count = properties.filter((p) => p.status === status).length;
      return {
        status,
        count,
        percentage: total === 0 ? 0 : (count / total) * 100,
      };
    });
  }
}