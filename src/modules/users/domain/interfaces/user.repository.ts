import type { UpdateUserDto } from "../../application/dtos/update-user.dto";
import type { User, UserId } from "../entities/user.entity";

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: UserId): Promise<User>;
  update(id: UserId, dto: UpdateUserDto): Promise<void>;
  delete(id: UserId): Promise<void>;
}