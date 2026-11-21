import type { Property } from "../../../properties/domain/entities/property.entity";
import type { AdminPropertyRequest } from "../../../requests/domain/entities/request.entity";
import type { PropertyWaitlist } from "../../domain/entities/requests-report.entity";

const fullName = (r: AdminPropertyRequest) =>
  `${r.applicant.name} ${r.applicant.lastname}`.trim();

/**
 * Reporte 4: listas de espera ACTUALES. Es una foto de hoy (no depende de las
 * fechas): por propiedad, quién va en cada puesto y quién tiene el trato en curso.
 * Solo salen las propiedades con alguien esperando o con un trato en curso.
 */
export class BuildWaitlistsReportUseCase {
  execute(
    requests: AdminPropertyRequest[],
    properties: Property[],
    propertyId?: string,
  ): PropertyWaitlist[] {
    const groups: PropertyWaitlist[] = [];

    for (const property of properties) {
      if (propertyId && property.id !== propertyId) continue;

      const ofProperty = requests.filter((r) => r.propertyId === property.id);
      const pending = ofProperty
        .filter((r) => r.status === "PENDING")
        .sort(
          (a, b) =>
            (a.posicionListaEspera ?? Number.MAX_SAFE_INTEGER) -
              (b.posicionListaEspera ?? Number.MAX_SAFE_INTEGER) ||
            a.createdAt.getTime() - b.createdAt.getTime(),
        );
      const approved = ofProperty.find((r) => r.status === "APPROVED");

      if (pending.length === 0 && !approved) continue;

      groups.push({
        propertyId: property.id,
        title: property.title,
        propertyStatus: property.status,
        inProgress: approved ? fullName(approved) : null,
        entries: pending.map((r, index) => ({
          position: r.posicionListaEspera ?? index + 1,
          name: fullName(r),
          email: r.applicant.email,
          telefono: r.telefono,
          createdAt: r.createdAt,
        })),
      });
    }

    // Primero las propiedades con más gente esperando
    return groups.sort(
      (a, b) => b.entries.length - a.entries.length || a.title.localeCompare(b.title, "es"),
    );
  }
}
