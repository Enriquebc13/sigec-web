import { createContext } from "react";
import type { LoginDto } from "../../application/dtos/LoginDto";
import type { RegisterDto } from "../../application/dtos/RegisterDto";
import type { AuthUser } from "../../domain/entities/AuthUser";

export type AuthContextValue = {
  user: AuthUser | null;
  login: (dto: LoginDto) => Promise<AuthUser>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);