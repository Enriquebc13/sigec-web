import type { AuthSession } from "../../domain/entities/AuthSession";
import type { AuthRepository } from "../../domain/interfaces/AuthRepository";
import type { LoginDto } from "../dtos/LoginDto";

export class LoginUseCase {
  private readonly repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  async execute({ email, password }: LoginDto): Promise<AuthSession> {
    if (!email.trim() || !password) {
      throw new Error("Correo y contraseña son obligatorios");
    }
    return this.repository.login({ email: email.trim(), password });
  }
}