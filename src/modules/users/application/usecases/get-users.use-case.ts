import type { User } from "../../domain/entities/user.entity";
import type { UserRepository } from "../../domain/interfaces/user.repository";

export class GetUsersUseCase {
  private readonly repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  execute(): Promise<User[]> {
    return this.repository.findAll();
  }
}