import type { PropertyRequest } from "../../domain/entities/request.entity";
import type { RequestRepository } from "../../domain/interfaces/request.repository";
import type { CreateRequestDto } from "../dtos/create-request.dto";

// "243 895 3612" o "(243) 895-3612" → "2438953612"
const normalizePhone = (value: string) => value.replace(/[\s()-]/g, "");

export class CreateRequestUseCase {
  private readonly repository: RequestRepository;

  constructor(repository: RequestRepository) {
    this.repository = repository;
  }

  execute(dto: CreateRequestDto): Promise<PropertyRequest> {
    const telefono = normalizePhone(dto.telefono);

    // Asumí números de 10 dígitos (como tu ejemplo); ajusta la regla si aceptan otro formato
    if (!/^\d{10}$/.test(telefono)) {
      throw new Error("Ingresa un número de teléfono de 10 dígitos");
    }
    if (!dto.propertyId) {
      throw new Error("No se pudo identificar la propiedad");
    }

    return this.repository.create({ telefono, propertyId: dto.propertyId });
  }
}