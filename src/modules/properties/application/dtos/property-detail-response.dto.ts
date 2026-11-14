import type {
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