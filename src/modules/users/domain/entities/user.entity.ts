export type UserRole = "ADMIN" | "CLIENT";

// Ajusta según tu schema.prisma: number si el id es autoincrement, string si es uuid
export type UserId = number | string;

export interface User {
  id: UserId;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}