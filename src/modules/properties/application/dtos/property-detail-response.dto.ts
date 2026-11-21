import type {
  AutoRejectedRequest,
  PropertyAddress,
  PropertyId,
  PropertyStatus,
  PropertyType,
} from "../../domain/entities/property.entity";

export interface PropertyImageResponseDto {
  id: string;
  url: string;
  createdAt: string;
  updatedAt: string | null;
  propertyId: PropertyId;
}

export interface PropertyDetailResponseDto {
  id: PropertyId;
  title: string;
  description: string | null;
  price: string;
  maintenanceCost: string | null;
  dimensions: string | null;
  floor: number | null;
  type: PropertyType;
  status: PropertyStatus;
  amenities: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  address: PropertyAddress;
  images: PropertyImageResponseDto[];
}

/** Respuesta de PUT /properties/:id: la propiedad más las solicitudes rechazadas automáticamente */
export interface UpdatePropertyResponseDto extends PropertyDetailResponseDto {
  autoRejectedRequests?: AutoRejectedRequest[];
}
