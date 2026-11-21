import type {
  PropertyStatus,
  PropertyType,
} from "../../../properties/domain/entities/property.entity";

export const STATUS_ORDER: PropertyStatus[] = [
  "AVAILABLE",
  "RESERVED",
  "RENTED",
  "UNAVAILABLE",
];

export const STATUS_PLURAL_LABELS: Record<PropertyStatus, string> = {
  AVAILABLE: "Disponibles",
  RESERVED: "Reservadas",
  RENTED: "Rentadas",
  UNAVAILABLE: "No disponibles",
};

export const TYPE_LABELS: Record<PropertyType, string> = {
  LOCAL: "Local",
  OFFICE: "Oficina",
  WAREHOUSE: "Bodega",
};

/** Una fila del reporte "Inventario por estado" */
export interface InventoryStatusRow {
  status: PropertyStatus;
  count: number;
  /** 0 a 100 */
  percentage: number;
}

/** Una fila del reporte "Propiedades rentadas" */
export interface RentedPropertyRow {
  propertyId: string;
  title: string;
  type: PropertyType;
  city: string;
  price: number;
  /** null si la propiedad está rentada pero no hay una solicitud aprobada */
  renter: {
    name: string;
    email: string;
    telefono: string;
    /** Fecha en que el cliente envió la solicitud */
    requestedAt: Date;
  } | null;
}

export interface PropertiesReportBundle {
  inventory: InventoryStatusRow[];
  rented: RentedPropertyRow[];
}

export type PropertiesReportSheet = "inventory" | "rented";

export const ALL_PROPERTY_SHEETS: PropertiesReportSheet[] = [
  "inventory",
  "rented",
];