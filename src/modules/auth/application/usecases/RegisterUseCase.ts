import type { AuthRepository } from "../../domain/interfaces/AuthRepository";
import type { RegisterDto } from "../dtos/RegisterDto";

export class RegisterUseCase {
  private readonly repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  async execute(dto: RegisterDto): Promise<void> {
    if (!dto.name.trim() || !dto.lastname.trim() || !dto.email.trim()) {
      throw new Error("Nombre, apellido y correo son obligatorios");
    }
    if (dto.password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }
    return this.repository.register({
      name: dto.name.trim(),
      lastname: dto.lastname.trim(),
      email: dto.email.trim(),
      password: dto.password,
    });
  }
}