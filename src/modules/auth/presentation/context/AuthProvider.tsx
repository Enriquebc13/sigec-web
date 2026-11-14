import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LoginDto } from "../../application/dtos/LoginDto";
import type { RegisterDto } from "../../application/dtos/RegisterDto";
import { RegisterUseCase } from "../../application/usecases/RegisterUseCase";
import type { AuthSession } from "../../domain/entities/AuthSession";
import { AuthApiRepository } from "../../infrastructure/repositories/AuthApiRepository";
import { AuthContext } from "./auth-context";
import { LoginUseCase } from "../../application/usecases/LoginUseCase";

const repository = new AuthApiRepository();
const loginUseCase = new LoginUseCase(repository);
const registerUseCase = new RegisterUseCase(repository);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lee la sesión guardada al arrancar, así no hay parpadeo al recargar
  const [session, setSession] = useState<AuthSession | null>(() =>
    repository.getStoredSession(),
  );

  const logout = useCallback(() => {
    repository.logout();
    setSession(null);
  }, []);

  const login = useCallback(async (dto: LoginDto) => {
    const newSession = await loginUseCase.execute(dto);
    setSession(newSession);
    return newSession.user;
  }, []);

  const register = useCallback(
    (dto: RegisterDto) => registerUseCase.execute(dto),
    [],
  );

  // El apiClient avisa cuando la API responde 401 (token vencido)
  useEffect(() => {
    window.addEventListener("auth:unauthorized", logout);
    return () => window.removeEventListener("auth:unauthorized", logout);
  }, [logout]);

  const value = useMemo(
    () => ({ user: session?.user ?? null, login, register, logout }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}