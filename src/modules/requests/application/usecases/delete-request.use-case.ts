import type { RequestStatus } from "../../domain/entities/request-history.entity";
import type { RequestRepository } from "../../domain/interfaces/request.repository";

export class DeleteRequestUseCase {
  private readonly repository: RequestRepository;

  constructor(repository: RequestRepository) {
    this.repository = repository;
  }

  execute(id: string, status: RequestStatus): Promise<void> {
    // Regla de negocio del front: la API no la valida
    if (status === "PENDING") {
      throw new Error("Las solicitudes pendientes no se pueden eliminar");
    }
    return this.repository.delete(id);
  }
}