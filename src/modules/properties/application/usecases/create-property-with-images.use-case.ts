import type { ImageRepository } from "../../../images/domain/interfaces/image.repository";
import type { PropertyId } from "../../domain/entities/property.entity";
import type { PropertyRepository } from "../../domain/interfaces/property.repository";
import type { CreatePropertyDto } from "../dtos/create-property.dto";

const MAX_FILES = 8;
const MAX_SIZE_MB = 5; // ajusta al límite real de tu API / Cloudinary

export type ProgressCallback = (done: number, total: number) => void;

export interface CreatePropertyResult {
  propertyId: PropertyId;
  /** Imágenes que no se pudieron subir; vacío si todo salió bien */
  failedFiles: File[];
}

export class CreatePropertyWithImagesUseCase {
  private readonly propertyRepository: PropertyRepository;
  private readonly imageRepository: ImageRepository;

  constructor(
    propertyRepository: PropertyRepository,
    imageRepository: ImageRepository,
  ) {
    this.propertyRepository = propertyRepository;
    this.imageRepository = imageRepository;
  }

  async execute(
    dto: CreatePropertyDto,
    files: File[],
    onProgress?: ProgressCallback,
  ): Promise<CreatePropertyResult> {
    // 1. Validar ANTES de crear nada
    this.validateProperty(dto);
    this.validateFiles(files);

    // 2. Crear la propiedad
    const propertyId = await this.propertyRepository.create(dto);

    // 3. Subir las imágenes ligadas a esa propiedad
    const failedFiles = await this.uploadImages(propertyId, files, onProgress);

    return { propertyId, failedFiles };
  }

  /** Reintenta solo las imágenes que fallaron, sobre la misma propiedad */
  retryImages(
    propertyId: PropertyId,
    files: File[],
    onProgress?: ProgressCallback,
  ): Promise<File[]> {
    this.validateFiles(files);
    return this.uploadImages(propertyId, files, onProgress);
  }

  // Mismas reglas (y mismos mensajes) que el CreatePropertyDto de la API
  private validateProperty(dto: CreatePropertyDto): void {
    if (!dto.title.trim()) {
      throw new Error("El título es obligatorio");
    }
    if (!Number.isFinite(dto.price) || dto.price < 0) {
      throw new Error("El precio debe ser un número mayor o igual a 0");
    }
    if (
      dto.maintenanceCost !== undefined &&
      (!Number.isFinite(dto.maintenanceCost) || dto.maintenanceCost < 0)
    ) {
      throw new Error(
        "El costo de mantenimiento debe ser un número mayor o igual a 0",
      );
    }
    if (dto.floor !== undefined && !Number.isInteger(dto.floor)) {
      throw new Error("El piso debe ser un número entero");
    }
  }

  private validateFiles(files: File[]): void {
    if (files.length > MAX_FILES) {
      throw new Error(`Máximo ${MAX_FILES} imágenes por propiedad`);
    }
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        throw new Error(`"${file.name}" no es una imagen`);
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        throw new Error(`"${file.name}" pesa más de ${MAX_SIZE_MB} MB`);
      }
    }
  }

  // Una por una y en orden: la primera queda como portada
  private async uploadImages(
    propertyId: PropertyId,
    files: File[],
    onProgress?: ProgressCallback,
  ): Promise<File[]> {
    const failed: File[] = [];

    for (const [index, file] of files.entries()) {
      try {
        await this.imageRepository.upload(propertyId, file);
      } catch {
        failed.push(file);
      }
      onProgress?.(index + 1, files.length);
    }

    return failed;
  }
}