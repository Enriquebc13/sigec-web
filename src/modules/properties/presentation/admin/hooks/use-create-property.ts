import { useState } from "react";
import { ApiError } from "../../../../../core/http/api-client";
import { ImageApiRepository } from "../../../../images/infrastructure/repositories/image-api.repository";
import type { CreatePropertyDto } from "../../../application/dtos/create-property.dto";
import { CreatePropertyWithImagesUseCase } from "../../../application/usecases/create-property-with-images.use-case";
import type { PropertyId } from "../../../domain/entities/property.entity";
import { PropertyApiRepository } from "../../../infrastructure/repositories/property-api.repository";

const useCase = new CreatePropertyWithImagesUseCase(
  new PropertyApiRepository(),
  new ImageApiRepository(),
);

/**
 * idle    → formulario listo
 * saving  → creando / subiendo
 * partial → la propiedad se creó pero fallaron algunas imágenes
 * done    → todo guardado
 */
type Status = "idle" | "saving" | "partial" | "done";

function toMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 403) {
    return "No tienes permisos para crear propiedades";
  }
  if (err instanceof TypeError) return "No se pudo conectar con el servidor";
  return err instanceof Error ? err.message : "No se pudo guardar la propiedad";
}

export function useCreateProperty() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<PropertyId | null>(null);
  const [failedFiles, setFailedFiles] = useState<File[]>([]);

  const submit = async (dto: CreatePropertyDto, files: File[]) => {
    setStatus("saving");
    setError(null);
    setProgress({ done: 0, total: files.length });

    try {
      const result = await useCase.execute(dto, files, (done, total) =>
        setProgress({ done, total }),
      );
      setPropertyId(result.propertyId);
      setFailedFiles(result.failedFiles);
      setStatus(result.failedFiles.length > 0 ? "partial" : "done");
    } catch (err) {
      // Falló la validación o la creación: no se creó nada
      setError(toMessage(err));
      setStatus("idle");
    }
  };

  const retry = async () => {
    if (!propertyId) return;
    setStatus("saving");
    setProgress({ done: 0, total: failedFiles.length });

    try {
      const stillFailed = await useCase.retryImages(
        propertyId,
        failedFiles,
        (done, total) => setProgress({ done, total }),
      );
      setFailedFiles(stillFailed);
      setStatus(stillFailed.length > 0 ? "partial" : "done");
    } catch (err) {
      setError(toMessage(err));
      setStatus("partial");
    }
  };

  const reset = () => {
    setStatus("idle");
    setProgress(null);
    setError(null);
    setPropertyId(null);
    setFailedFiles([]);
  };

  return { status, progress, error, failedFiles, submit, retry, reset };
}