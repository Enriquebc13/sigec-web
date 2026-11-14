import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "../../domain/entities/AuthUser";
import { HOME_BY_ROLE } from "../home-by-role";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ allowedRole }: { allowedRole?: Role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Un cliente que intenta entrar a /admin vuelve a su propio home
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  }

  return <Outlet />;
}