import type { PropertyId } from "../../domain/entities/property.entity";
import type { PropertyRepository } from "../../domain/interfaces/property.repository";

export class DeletePropertyUseCase {
  private readonly repository: PropertyRepository;

  constructor(repository: PropertyRepository) {
    this.repository = repository;
  }

  execute(id: PropertyId): Promise<void> {
    if (!id) {
      throw new Error("No se pudo identificar la propiedad");
    }
    return this.repository.delete(id);
  }
}