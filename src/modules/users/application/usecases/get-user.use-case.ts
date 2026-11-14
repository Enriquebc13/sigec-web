import type { User, UserId } from "../../domain/entities/user.entity";
import type { UserRepository } from "../../domain/interfaces/user.repository";

export class GetUserUseCase {
  private readonly repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  execute(id: UserId): Promise<User> {
    if (!id) {
      throw new Error("No se pudo identificar al usuario");
    }
    return this.repository.findById(id);
  }
}