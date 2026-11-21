import type { CreatePropertyDto } from "../../application/dtos/create-property.dto";
import type { UpdatePropertyDto } from "../../application/dtos/update-property.dto";
import type {
  Property,
  PropertyId,
  UpdatePropertyResult,
} from "../entities/property.entity";

export interface PropertyRepository {
  findAll(): Promise<Property[]>;
  create(dto: CreatePropertyDto): Promise<PropertyId>;
  /**
   * Además de la propiedad devuelve las solicitudes que la API rechazó solas:
   * al pasar a RENTED (las PENDING) o de RESERVED a AVAILABLE (la APPROVED).
   */
  update(id: PropertyId, dto: UpdatePropertyDto): Promise<UpdatePropertyResult>;
  delete(id: PropertyId): Promise<void>;
}