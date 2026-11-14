import { AppNav, type NavItem } from "../../../../components/AppNav";
import type { Role } from "../../domain/entities/AuthUser";
import { HOME_BY_ROLE } from "../home-by-role";
import { useAuth } from "../hooks/useAuth";

// Solo rutas que existen hoy; "Lista de espera" se agrega cuando haya pantalla
const NAV_LINKS: Record<Role, NavItem[]> = {
  CLIENT: [
    { label: "Inicio", to: "/client/home" },
    { label: "Catálogo", to: "/client/properties" },
    { label: "Mis solicitudes", to: "/client/requests" },
    { label: "Perfil", to: "/client/profile" },
  ],
  ADMIN: [
    { label: "Inicio", to: "/admin/home" },
    { label: "Usuarios", to: "/admin/users" },
    { label: "Propiedades", to: "/admin/properties" },
    { label: "Solicitudes", to: "/admin/requests" },
    { label: "Reportes", to: "/admin/reports" },
    { label: "Perfil", to: "/admin/profile" },
    
  ],
};

export function RoleNav() {
  const { user, logout } = useAuth();

  // Estas pantallas ya están protegidas; por si acaso, sin sesión no se pinta nada
  if (!user) return null;

  return (
    <AppNav
      links={NAV_LINKS[user.role]}
      homePath={HOME_BY_ROLE[user.role]}
      onLogout={logout}
    />
  );
}