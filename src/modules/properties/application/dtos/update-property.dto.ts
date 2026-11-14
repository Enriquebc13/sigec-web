import type {
  PropertyStatus,
  PropertyType,
} from "../../domain/entities/property.entity";
import type { AddressDto } from "./address.dto";

export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  price?: number;
  /** null: se quita el valor */
  maintenanceCost?: number | null;
  dimensions?: string;
  /** null: se quita el valor */
  floor?: number | null;
  type?: PropertyType;
  status?: PropertyStatus;
  amenities?: string;
  address?: AddressDto;
}