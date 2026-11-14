export interface ImageRepository {
  upload(propertyId: string, file: File): Promise<void>;
}