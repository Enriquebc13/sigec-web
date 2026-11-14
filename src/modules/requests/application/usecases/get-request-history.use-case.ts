import type { RequestHistory } from "../../domain/entities/request-history.entity";
import type { RequestHistoryRepository } from "../../domain/interfaces/request-history.repository";

export class GetRequestHistoryUseCase {
  private readonly repository: RequestHistoryRepository;

  constructor(repository: RequestHistoryRepository) {
    this.repository = repository;
  }

  execute(): Promise<RequestHistory[]> {
    return this.repository.findAll();
  }
}