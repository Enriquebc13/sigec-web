import type {
  PropertyId,
  UpdatePropertyResult,
} from "../../domain/entities/property.entity";
import type { PropertyRepository } from "../../domain/interfaces/property.repository";
import type { UpdatePropertyDto } from "../dtos/update-property.dto";

export class UpdatePropertyUseCase {
  private readonly repository: PropertyRepository;

  constructor(repository: PropertyRepository) {
    this.repository = repository;
  }

  execute(
    id: PropertyId,
    dto: UpdatePropertyDto,
  ): Promise<UpdatePropertyResult> {
    if (Object.keys(dto).length === 0) {
      throw new Error("No hay cambios que guardar");
    }

    // Mismas reglas (y mensajes) que el UpdatePropertyDto de la API
    if (dto.title !== undefined && !dto.title.trim()) {
      throw new Error("El título es obligatorio");
    }
    if (dto.price !== undefined && (!Number.isFinite(dto.price) || dto.price < 0)) {
      throw new Error("El precio debe ser un número mayor o igual a 0");
    }
    if (
      dto.maintenanceCost !== undefined &&
      dto.maintenanceCost !== null &&
      (!Number.isFinite(dto.maintenanceCost) || dto.maintenanceCost < 0)
    ) {
      throw new Error(
        "El costo de mantenimiento debe ser un número mayor o igual a 0",
      );
    }
    if (
      dto.floor !== undefined &&
      dto.floor !== null &&
      !Number.isInteger(dto.floor)
    ) {
      throw new Error("El piso debe ser un número entero");
    }
    if (dto.address) {
      const { street, city, state, zipCode } = dto.address;
      if (![street, city, state, zipCode].every((v) => v.trim())) {
        throw new Error("Completa todos los campos de la dirección");
      }
    }

    return this.repository.update(id, dto);
  }
}