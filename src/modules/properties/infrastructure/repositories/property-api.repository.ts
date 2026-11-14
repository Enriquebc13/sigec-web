import { apiClient } from "../../../../core/http/api-client";
import type { CreatePropertyDto } from "../../application/dtos/create-property.dto";
import type { PropertyDetailResponseDto } from "../../application/dtos/property-detail-response.dto";
import type { UpdatePropertyDto } from "../../application/dtos/update-property.dto";
import type { Property, PropertyId } from "../../domain/entities/property.entity";
import type { PropertyRepository } from "../../domain/interfaces/property.repository";

// Convierte lo que manda la API (decimales y fechas como texto) en la entidad
function toProperty(dto: PropertyDetailResponseDto): Property {
  return {
    ...dto,
    price: Number(dto.price),
    maintenanceCost:
      dto.maintenanceCost === null ? null : Number(dto.maintenanceCost),
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
    images: dto.images.map((image) => ({
      id: image.id,
      url: image.url,
      propertyId: image.propertyId,
      createdAt: new Date(image.createdAt),
    })),
  };
}

export class PropertyApiRepository implements PropertyRepository {
  async findAll(): Promise<Property[]> {
    const data = await apiClient<PropertyDetailResponseDto[]>("/properties");
    return data.map(toProperty);
  }

  async create(dto: CreatePropertyDto): Promise<PropertyId> {
    // La respuesta trae el id de la propiedad recién creada
    const created = await apiClient<{ id: PropertyId }>("/properties", {
      method: "POST",
      body: dto,
    });
    return created.id;
  }
  async update(id: PropertyId, dto: UpdatePropertyDto): Promise<Property> {
    // Solo ADMIN. Aunque es PUT, todos los campos son opcionales: se manda lo que cambió
    const data = await apiClient<PropertyDetailResponseDto>(
      `/properties/${id}`,
      { method: "PUT", body: dto },
    );
    return toProperty(data);
  }

  async delete(id: PropertyId): Promise<void> {
    // Solo ADMIN. La API responde { message } y limpia las imágenes de Cloudinary
    await apiClient<unknown>(`/properties/${id}`, { method: "DELETE" });
  }
}