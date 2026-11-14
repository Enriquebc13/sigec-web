import type { PropertyRequest } from "../../domain/entities/request.entity";
import type { RequestRepository } from "../../domain/interfaces/request.repository";

export class GetMyRequestsUseCase {
  private readonly repository: RequestRepository;

  constructor(repository: RequestRepository) {
    this.repository = repository;
  }

  async execute(): Promise<PropertyRequest[]> {
    const requests = await this.repository.findMine();
    // Tu API no ordena esta consulta: las más recientes van primero
    return [...requests].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}