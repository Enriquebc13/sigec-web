import type { Property } from "../../../properties/domain/entities/property.entity";
import type { AdminPropertyRequest } from "../../../requests/domain/entities/request.entity";
import type { RentedPropertyRow } from "../../domain/entities/properties-report.entity";

/**
 * Reporte 9: propiedades rentadas y a quién. El inquilino es el solicitante de
 * la solicitud APPROVED de esa propiedad (datos que solo ve el admin).
 */
export class BuildRentedPropertiesUseCase {
  execute(
    properties: Property[],
    requests: AdminPropertyRequest[],
  ): RentedPropertyRow[] {
    return properties
      .filter((p) => p.status === "RENTED")
      .map((property) => {
        const approved = requests.find(
          (r) => r.propertyId === property.id && r.status === "APPROVED",
        );

        return {
          propertyId: property.id,
          title: property.title,
          type: property.type,
          city: property.address?.city ?? "",
          price: property.price,
          renter: approved
            ? {
                name: `${approved.applicant.name} ${approved.applicant.lastname}`.trim(),
                email: approved.applicant.email,
                telefono: approved.telefono,
                requestedAt: approved.createdAt,
              }
            : null,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title, "es"));
  }
}