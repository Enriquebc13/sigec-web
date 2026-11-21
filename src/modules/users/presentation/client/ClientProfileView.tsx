import { useNavigate } from "react-router-dom";
import { ProfileScreen } from "../../../../components/ProfileScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";
import { useAuth } from "../../../auth/presentation/hooks/useAuth";
import { RentedPropertiesSection } from "../../../requests/presentation/client/components/RentedPropertiesSection";
import { useUserProfile } from "../admin/hooks/use-user-profile";

export function ClientProfileView() {
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
      title="¡Bienvenido!"
      subtitle="Aquí puedes consultar los datos de tu cuenta."
      roleLabel="Cliente"
      email={user?.email}
      userId={user?.id}
      fullName={profile ? `${profile.name} ${profile.lastname}` : undefined}
      memberSince={profile?.createdAt}
      sessionExpiresAt={user?.expiresAt}
      detailsLoading={loading}
      detailsError={error}
      onSignOut={handleSignOut}
      extra={<RentedPropertiesSection />}
    />
  );
}