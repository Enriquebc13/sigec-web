import type { RequestStatus } from "../../domain/entities/request-history.entity";
import type { PropertyRequest } from "../../domain/entities/request.entity";
import type { RequestRepository } from "../../domain/interfaces/request.repository";

// "243 895 3612" o "(243) 895-3612" → "2438953612"
const normalizePhone = (value: string) => value.replace(/[\s()-]/g, "");

export class UpdateRequestPhoneUseCase {
  private readonly repository: RequestRepository;

  constructor(repository: RequestRepository) {
    this.repository = repository;
  }

  execute(
    id: string,
    status: RequestStatus,
    telefono: string,
  ): Promise<PropertyRequest> {
    if (status === "REJECTED") {
      throw new Error(
        "No puedes editar el teléfono de una solicitud rechazada o cancelada",
      );
    }
    const normalized = normalizePhone(telefono);
    // Misma regla que al crear la solicitud
    if (!/^\d{10}$/.test(normalized)) {
      throw new Error("Ingresa un número de teléfono de 10 dígitos");
    }
    return this.repository.updatePhone(id, normalized);
  }
}
