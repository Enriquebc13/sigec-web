import { apiClient } from "../../../../core/http/api-client";
import { tokenStorage } from "../../../../core/storage/token-storage";
import type { LoginDto } from "../../application/dtos/LoginDto";
import type { RegisterDto } from "../../application/dtos/RegisterDto";
import type { AuthSession } from "../../domain/entities/AuthSession";
import type { AuthRepository } from "../../domain/interfaces/AuthRepository";
import { decodeJwt } from "../jwt";

function toSession(accessToken: string): AuthSession | null {
  const payload = decodeJwt(accessToken);
  if (!payload) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;

  return {
    accessToken,
    user: {
      id: String(payload.sub ?? ""),
      email: payload.email ?? "",
      // Si el rol no es ADMIN, se trata como CLIENT (el permiso más bajo)
      role: payload.role === "ADMIN" ? "ADMIN" : "CLIENT",
      // `exp` viene en segundos; Date espera milisegundos
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
    },
  };
}

export class AuthApiRepository implements AuthRepository {
  async login({ email, password }: LoginDto): Promise<AuthSession> {
    const { access_token } = await apiClient<{ access_token: string }>(
      "/auth/login",
      { method: "POST", body: { email, password }, auth: false },
    );

    const session = toSession(access_token);
    if (!session) throw new Error("La API devolvió un token inválido");

    tokenStorage.set(access_token);
    return session;
  }

  async register(dto: RegisterDto): Promise<void> {
    await apiClient<unknown>("/users", {
      method: "POST",
      body: dto,
      auth: false,
    });
  }

  getStoredSession(): AuthSession | null {
    const token = tokenStorage.get();
    if (!token) return null;

    const session = toSession(token);
    if (!session) tokenStorage.clear(); // token roto o vencido
    return session;
  }

  logout(): void {
    tokenStorage.clear();
  }
}