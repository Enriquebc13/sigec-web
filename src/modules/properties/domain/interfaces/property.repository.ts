import type { CreatePropertyDto } from "../../application/dtos/create-property.dto";
import type { UpdatePropertyDto } from "../../application/dtos/update-property.dto";
import type { Property, PropertyId } from "../entities/property.entity";

export interface PropertyRepository {
  findAll(): Promise<Property[]>;
  create(dto: CreatePropertyDto): Promise<PropertyId>;
  update(id: PropertyId, dto: UpdatePropertyDto): Promise<Property>;
  delete(id: PropertyId): Promise<void>;
}