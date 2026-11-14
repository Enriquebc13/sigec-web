import type { PropertyType } from "../../domain/entities/property.entity";
import type { AddressDto } from "./address.dto";

export interface CreatePropertyDto {
  title: string;
  description?: string;
  price: number;
  maintenanceCost?: number;
  dimensions?: string;
  floor?: number;
  type: PropertyType;
  amenities?: string;
  address: AddressDto;
  userId: string;
}