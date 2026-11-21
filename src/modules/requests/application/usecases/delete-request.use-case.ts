import type { RequestStatus } from "../../domain/entities/request-history.entity";
import type { RequestRepository } from "../../domain/interfaces/request.repository";

export class DeleteRequestUseCase {
  private readonly repository: RequestRepository;

  constructor(repository: RequestRepository) {
    this.repository = repository;
  }

  execute(id: string, status: RequestStatus): Promise<void> {
    // Reglas de negocio del front: la API no las valida
    if (status === "PENDING") {
      throw new Error("Las solicitudes pendientes no se pueden eliminar");
    }
    // Una solicitud aprobada tiene la propiedad reservada: borrarla la dejaría bloqueada
    if (status === "APPROVED") {
      throw new Error(
        "Una solicitud aprobada no se puede eliminar. Contacta al administrador si ya no te interesa",
      );
    }
    return this.repository.delete(id);
  }
}