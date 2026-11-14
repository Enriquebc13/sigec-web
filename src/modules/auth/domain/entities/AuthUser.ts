export type Role = "ADMIN" | "CLIENT";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
   /** Cuándo vence el token (dato `exp` del JWT); null si el token no lo trae */
  expiresAt: Date | null;
}