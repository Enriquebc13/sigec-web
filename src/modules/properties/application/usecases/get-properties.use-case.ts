import type { Property } from "../../domain/entities/property.entity";
import type { PropertyRepository } from "../../domain/interfaces/property.repository";

export class GetPropertiesUseCase {
  private readonly repository: PropertyRepository;

  constructor(repository: PropertyRepository) {
    this.repository = repository;
  }

  execute(): Promise<Property[]> {
    return this.repository.findAll();
  }
}