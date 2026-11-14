import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./modules/auth/presentation/context/AuthProvider";
import { ProtectedRoute } from "./modules/auth/presentation/components/ProtectedRoute";
import { Landing } from "./modules/landing/presentation/pages/Landing";
import { About } from "./modules/landing/presentation/pages/About";
import { GuestRoute } from "./modules/auth/presentation/components/GuestRoute";
import { Login } from "./modules/auth/presentation/pages/login";
import { Register } from "./modules/auth/presentation/pages/register";
import { HomeClient } from "./modules/home/pages/HomeClient";
import { HomeAdmin } from "./modules/home/pages/HomeAdmin";
import { ListUsersView } from "./modules/users/presentation/admin/ListUsersView";
import { AdminProfileView } from "./modules/users/presentation/admin/AdminProfileView";
import { ClientProfileView } from "./modules/users/presentation/client/ClientProfileView";
import { PropertiesView } from "./modules/properties/presentation/admin/PropertiesView";
import { ListRequestHistoryView } from "./modules/requests/presentation/admin/ListRequestHistoryView";
import { ClientPropertiesView } from "./modules/properties/presentation/client/ClientPropertiesView";
import { MyRequestsView } from "./modules/requests/presentation/client/MyRequestsView";
import ReportsView from "./modules/reports/presentation/admin/ReportsView";
import { ClientAbout } from "./modules/landing/presentation/pages/ClientAbout";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About backTo="/" />} />

          {/* Solo sin sesión */}
          <Route element={<GuestRoute/>}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
          </Route>

          {/* Solo clientes */}
          <Route element={<ProtectedRoute allowedRole="CLIENT" />}>
            <Route path="/client/home" element={<HomeClient />} />
            <Route path="/client/profile" element={<ClientProfileView />} />
            <Route path="/client/ClientAbout" element={<ClientAbout/>} />
            <Route path="/client/requests" element={<MyRequestsView />} />
            <Route path="/client/properties" element={<ClientPropertiesView />} />
          </Route>

          {/* Solo admin (se llena cuando exista el panel) */}
          <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
          <Route path="/admin/home" element={<HomeAdmin />} />
            <Route path="/admin/about" element={<About backTo="/admin/home" />} />
            <Route path="/admin/profile" element={<AdminProfileView />} />
            <Route path="/admin/users" element={<ListUsersView />} />
            <Route path="/admin/properties" element={<PropertiesView />} />
            <Route path="/admin/requests" element={<ListRequestHistoryView />} />
            <Route path="/admin/reports" element={<ReportsView />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;