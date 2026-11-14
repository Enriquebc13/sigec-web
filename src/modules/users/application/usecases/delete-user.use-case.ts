import type { UserId } from "../../domain/entities/user.entity";
import type { UserRepository } from "../../domain/interfaces/user.repository";

export class DeleteUserUseCase {
  private readonly repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  execute(id: UserId): Promise<void> {
    return this.repository.delete(id);
  }
}