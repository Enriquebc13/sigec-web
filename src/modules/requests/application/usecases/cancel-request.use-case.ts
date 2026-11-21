import type { RequestStatus } from "../../domain/entities/request-history.entity";
import type { PropertyRequest } from "../../domain/entities/request.entity";
import type { RequestRepository } from "../../domain/interfaces/request.repository";

export class CancelRequestUseCase {
  private readonly repository: RequestRepository;

  constructor(repository: RequestRepository) {
    this.repository = repository;
  }

  execute(id: string, status: RequestStatus): Promise<PropertyRequest> {
    // Una aprobada tiene la propiedad reservada: se cancela con el administrador
    if (status !== "PENDING") {
      throw new Error(
        "Solo puedes cancelar solicitudes pendientes. Si ya fue aprobada, contacta al administrador",
      );
    }
    return this.repository.cancel(id);
  }
}
