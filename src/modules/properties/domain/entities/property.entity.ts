export type PropertyId = string;
export type PropertyType = "LOCAL" | "OFFICE" | "WAREHOUSE";
export type PropertyStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "RENTED"
  | "UNAVAILABLE";

export interface PropertyAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  propertyId: PropertyId;
}

export interface PropertyImage {
  id: string;
  url: string;
  createdAt: Date;
  propertyId: PropertyId;
}

export interface Property {
  id: PropertyId;
  title: string;
  description: string | null;
  price: number;
  maintenanceCost: number | null;
  dimensions: string | null;
  floor: number | null;
  type: PropertyType;
  status: PropertyStatus;
  amenities: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  address: PropertyAddress;
  images: PropertyImage[];
}