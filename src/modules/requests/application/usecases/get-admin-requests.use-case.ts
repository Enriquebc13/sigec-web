import type { AdminPropertyRequest } from "../../domain/entities/request.entity";
import type {
  RequestFilters,
  RequestRepository,
} from "../../domain/interfaces/request.repository";

export class GetAdminRequestsUseCase {
  private readonly repository: RequestRepository;

  constructor(repository: RequestRepository) {
    this.repository = repository;
  }

  async execute(filters: RequestFilters = {}): Promise<AdminPropertyRequest[]> {
    const requests = await this.repository.findAll(filters);
    // La API manda las más recientes primero; la fila de espera va de la más antigua a la más reciente
    return [...requests].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }
}
