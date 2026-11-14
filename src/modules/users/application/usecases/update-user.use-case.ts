import type { UserId } from "../../domain/entities/user.entity";
import type { UserRepository } from "../../domain/interfaces/user.repository";
import type { UpdateUserDto } from "../dtos/update-user.dto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UpdateUserUseCase {
  private readonly repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  execute(id: UserId, dto: UpdateUserDto): Promise<void> {
    if (dto.name !== undefined && !dto.name.trim()) {
      throw new Error("Por favor ingresa un nombre válido");
    }
    if (dto.lastname !== undefined && !dto.lastname.trim()) {
      throw new Error("Por favor ingresa un apellido válido");
    }
    if (dto.email !== undefined && !EMAIL_REGEX.test(dto.email.trim())) {
      throw new Error("El correo ingresado no es válido");
    }
    return this.repository.update(id, dto);
  }
}