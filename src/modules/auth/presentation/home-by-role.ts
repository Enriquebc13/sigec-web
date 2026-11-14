import type { Role } from "../domain/entities/AuthUser";

export const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: "/admin/home",
  CLIENT: "/client/home",
};

/**
 * A dónde ir después de iniciar sesión. Si el cliente venía de "Me interesa",
 * vuelve a esa propiedad; en cualquier otro caso, a su panel.
 */
export function postLoginPath(role: Role, from?: string): string {
  const isClientPath = from?.startsWith("/client/");
  return role === "CLIENT" && from && isClientPath ? from : HOME_BY_ROLE[role];
}