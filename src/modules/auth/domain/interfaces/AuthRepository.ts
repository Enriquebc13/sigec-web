import type { LoginDto } from "../../application/dtos/LoginDto";
import type { RegisterDto } from "../../application/dtos/RegisterDto";
import type { AuthSession } from "../entities/AuthSession";

export interface AuthRepository {
  login(dto: LoginDto): Promise<AuthSession>;
  register(dto: RegisterDto): Promise<void>;
  getStoredSession(): AuthSession | null;
  logout(): void;
}