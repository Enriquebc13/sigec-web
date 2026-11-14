import { tokenStorage } from "../storage/token-storage";

const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** false para endpoints públicos (login, registro) */
  auth?: boolean;
};

export async function apiClient<T>(
  path: string,
  { body, auth = true, headers, ...rest }: RequestOptions = {},
): Promise<T> {
  const token = auth ? tokenStorage.get() : null;
  const isFormData = body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    },
     body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
  });

  if (!response.ok) {
    // Token vencido o inválido: avisamos para cerrar la sesión
    if (response.status === 401 && auth) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    const data = await response.json().catch(() => null);
    // NestJS manda `message` como texto o como lista (validaciones)
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : (data?.message ?? `Error ${response.status}`);
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;

  // Algunas respuestas (DELETE, PATCH) pueden venir sin cuerpo
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** multipart/form-data (sin Content-Type: el navegador añade el boundary) */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  { auth = true }: { auth?: boolean } = {},
): Promise<T> {
  const token = auth ? tokenStorage.get() : null;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401 && auth) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    const data = await response.json().catch(() => null);
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : (data?.message ?? `Error ${response.status}`);
    throw new ApiError(message, response.status);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}