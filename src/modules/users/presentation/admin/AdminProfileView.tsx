import { useNavigate } from "react-router-dom";
import { ProfileScreen } from "../../../../components/ProfileScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";
import { useAuth } from "../../../auth/presentation/hooks/useAuth";
import { useUserProfile } from "./hooks/use-user-profile";


export function AdminProfileView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { profile, loading, error } = useUserProfile(user?.id);

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <ProfileScreen
      nav={<RoleNav />}
      title="Bienvenido administrador"
      roleLabel="Administrador"
      email={user?.email}
      userId={user?.id}
      fullName={profile ? `${profile.name} ${profile.lastname}` : undefined}
      memberSince={profile?.createdAt}
      sessionExpiresAt={user?.expiresAt}
      detailsLoading={loading}
      detailsError={error}
      onSignOut={handleSignOut}
    />
  );
}