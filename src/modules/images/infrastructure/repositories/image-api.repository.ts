import { apiClient } from "../../../../core/http/api-client";
import type { ImageRepository } from "../../domain/interfaces/image.repository";

export class ImageApiRepository implements ImageRepository {
  async upload(propertyId: string, file: File): Promise<void> {
    const form = new FormData();
    form.append("file", file);
    form.append("propertyId", propertyId);

    await apiClient<unknown>("/images", { method: "POST", body: form });
  }
}