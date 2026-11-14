import { Navigate, Outlet, useLocation } from "react-router-dom";
import { postLoginPath } from "../home-by-role";
import { useAuth } from "../hooks/useAuth";

export function GuestRoute() {
  const { user } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  if (user) {
    return <Navigate to={postLoginPath(user.role, from)} replace />;
  }

  return <Outlet />;
}