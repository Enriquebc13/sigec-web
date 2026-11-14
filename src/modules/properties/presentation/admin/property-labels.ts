import type {
  PropertyStatus,
  PropertyType,
} from "../../domain/entities/property.entity";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  LOCAL: "Local",
  OFFICE: "Oficina",
  WAREHOUSE: "Bodega",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservada",
  RENTED: "Rentada",
  UNAVAILABLE: "No disponible",
};