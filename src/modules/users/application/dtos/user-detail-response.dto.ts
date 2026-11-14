import type { UserId, UserRole } from "../../domain/entities/user.entity";

export interface UserDetailResponseDto {
  id: UserId;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}