
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  ClipboardList,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import logoSigec from "../../../assets/logo-sigec.svg";
import "./HomeAdmin.css";
import { useAuth } from "../../auth/presentation/hooks/useAuth";
import { useUsers } from "../../users/presentation/admin/hooks/use-users";
import { useProperties } from "../../properties/presentation/admin/hooks/use-properties";
import { useRequestHistory } from "../../requests/presentation/admin/hooks/use-request-history";
import { ConfirmDialog } from "../../../components/ConfirmDialog";

type Option = {
  icon: string;
  title: string;
  description: string;
  to: string;
};

const options: Option[] = [
  {
    icon: "👥",
    title: "Usuarios",
    description: "Consulta, edita y elimina las cuentas registradas.",
    to: "/admin/users",
  },
  {
    icon: "🏢",
    title: "Espacios",
    description: "Administra locales, oficinas y bodegas.",
    to: "/admin/properties",
  },
  {
    icon: "📨",
    title: "Solicitudes",
    description: "Revisa y responde las solicitudes de los interesados.",
    to: "/admin/requests",
  },
  {
    icon: "⏳",
    title: "Listas de espera",
    description: "Consulta quién sigue en la fila de cada espacio.",
    to: "/admin/waitlist",
  },
  {
    icon: "👤",
    title: "Mi perfil",
    description: "Administra tu información de cuenta.",
    to: "/admin/profile",
  },
  
];

const navLinks = [
  { label: "Usuarios", to: "/admin/users" },
  { label: "Espacios", to: "/admin/properties" },
  { label: "Solicitudes", to: "/admin/requests" },
   { label: "Reportess", to: "/admin/reports" },
];

const COLORS = {
  purple: "#8559f0",
  lavender: "#c9b3ff",
  teal: "#49b6ad",
  blue: "#5478d5",
  gray: "#777080",
};

const userColors: Record<string, string> = {
  ADMIN: COLORS.teal,
  CLIENT: COLORS.purple,
};

const propertyColors: Record<string, string> = {
  AVAILABLE: COLORS.teal,
  RESERVED: COLORS.lavender,
  RENTED: COLORS.purple,
  UNAVAILABLE: COLORS.gray,
};

// const userLabels: Record<string, string> = {
//   ADMIN: "Administradores",
//   CLIENT: "Clientes",
// };

// const propertyLabels: Record<string, string> = {
//   AVAILABLE: "Disponibles",
//   RESERVED: "Reservados",
//   RENTED: "Rentados",
//   UNAVAILABLE: "No disponibles",
// };

function OptionCard({ icon, title, description, to }: Option) {
  return (
    <Link to={to} className="home__card">
      <span className="home__card-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="home__card-title">{title}</span>
      <span className="home__card-description">{description}</span>
      <span className="home__card-cta">Administrar →</span>
    </Link>
  );
}

type DashboardChartProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  total: number;
  data: { name: string; value: number; color: string }[];
  loading?: boolean;
  error?: boolean;
  emptyMessage?: string;
};

function DashboardChart({
  title,
  subtitle,
  icon,
  total,
  data,
  loading = false,
  error = false,
  emptyMessage = "No hay registros todavía",
}: DashboardChartProps) {
  const hasData = data.some((item) => item.value > 0);

  return (
    <article className="home__chart-card">
      <div className="home__chart-header">
        <div className="home__chart-heading">
          <span className="home__chart-icon">{icon}</span>
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="home__chart-message">
          <span className="home__chart-spinner" />
          Cargando información...
        </div>
      ) : error ? (
        <div className="home__chart-message">
          No se pudo cargar la información.
        </div>
      ) : (
        <>
          <div className="home__chart-content">
            <div className="home__donut">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="68%"
                      outerRadius="92%"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {data.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        name,
                      ]}
                      contentStyle={{
                        background: "#171020",
                        border: "1px solid rgba(201,179,255,.2)",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="home__donut-empty">
                  <span>0</span>
                  <small>Registros</small>
                </div>
              )}

              {hasData && (
                <div className="home__donut-center">
                  <strong>{total}</strong>
                  <span>Total</span>
                </div>
              )}
            </div>

            <div className="home__chart-legend">
              {data.map((item) => (
                <div className="home__legend-item" key={item.name}>
                  <span
                    className="home__legend-dot"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="home__legend-name">{item.name}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {!hasData && (
            <p className="home__chart-empty">{emptyMessage}</p>
          )}
        </>
      )}
    </article>
  );
}

export function HomeAdmin() {
  const { user, logout } = useAuth();

  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useUsers();

  const {
    properties,
    loading: propertyLoading,
    error: propertiesError,
  } = useProperties();

  const {
    history,
    loading: requestsLoading,
    error: requestsError,
  } = useRequestHistory();


  const [scrolled, setScrolled] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Distribución de usuarios por rol
  const usersData = [
    {
      name: "Administradores",
      value: users.filter((u) => u.role === "ADMIN").length,
      color: userColors.ADMIN,
    },
    {
      name: "Clientes",
      value: users.filter((u) => u.role === "CLIENT").length,
      color: userColors.CLIENT,
    },
  ];

  // Distribución de espacios por estado
  const propertiesData = [
    {
      name: "Disponibles",
      value: properties.filter((p) => p.status === "AVAILABLE").length,
      color: propertyColors.AVAILABLE,
    },
    {
      name: "Reservados",
      value: properties.filter((p) => p.status === "RESERVED").length,
      color: propertyColors.RESERVED,
    },
    {
      name: "Rentados",
      value: properties.filter((p) => p.status === "RENTED").length,
      color: propertyColors.RENTED,
    },
    {
      name: "No disponibles",
      value: properties.filter((p) => p.status === "UNAVAILABLE").length,
      color: propertyColors.UNAVAILABLE,
    },
  ];

  // Obtener la última versión del historial de cada solicitud
  const requestsByStatus = useMemo(() => {
    const latestRequests = new Map<
      string,
      (typeof history)[number]
    >();

    history.forEach((event) => {
      const current = latestRequests.get(event.requestId);

      if (
        !current ||
        new Date(event.changedAt).getTime() >
        new Date(current.changedAt).getTime()
      ) {
        latestRequests.set(event.requestId, event);
      }
    });

    const requests = Array.from(latestRequests.values());

    return [
      {
        name: "Pendientes",
        value: requests.filter(
          (item) => item.request.status === "PENDING",
        ).length,
        color: COLORS.purple,
      },
      {
        name: "Aprobadas",
        value: requests.filter(
          (item) => item.request.status === "APPROVED",
        ).length,
        color: COLORS.teal,
      },
      {
        name: "Rechazadas",
        value: requests.filter(
          (item) => item.request.status === "REJECTED",
        ).length,
        color: COLORS.lavender,
      },
    ];
  }, [history]);

  const totalRequests = requestsByStatus.reduce(
    (total, item) => total + item.value,
    0,
  );

  // const pendingRequests =
  //   requestsByStatus.find((item) => item.name === "Pendientes")?.value ?? 0;

  const summary = [
    {
      icon: <Users size={20} />,
      label: "Usuarios registrados",
      value: usersLoading
        ? "..."
        : usersError
          ? "—"
          : String(users.length),
    },
    {
      icon: <Building2 size={20} />,
      label: "Espacios registrados",
      value: propertyLoading
        ? "..."
        : propertiesError
          ? "—"
          : String(properties.length),
    },
    {
  icon: <ClipboardList size={20} />,
  label: "Total de solicitudes",
  value: requestsLoading
    ? "..."
    : requestsError
      ? "—"
      : String(totalRequests),
},
    // {
    //   icon: <ClipboardList size={20} />,
    //   label: "Solicitudes pendientes",
    //   value: requestsLoading
    //     ? "..."
    //     : requestsError
    //       ? "—"
    //       : String(pendingRequests),
    // },
  ];

  return (
    <main className="home">
      {/* Navbar */}
      <header className={`home__nav${scrolled ? " home__nav--scrolled" : ""}`}>
        <Link to="/admin/home" className="home__brand">
          <img src={logoSigec} alt="" width="40" height="40" />
          <span>SIGEC</span>
        </Link>

        <nav className="home__links" aria-label="Navegación principal">
          <Link to="/admin/home" className="home__link--active">
            Inicio
          </Link>

          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="home__logout"
          onClick={() => setConfirmingLogout(true)}
        >
          Cerrar sesión
        </button>
      </header>

      {/* Hero */}
      <section className="home__hero">
        <div className="home__rays" aria-hidden="true" />

        <div className="home__building" aria-hidden="true">
          <img src={logoSigec} alt="" />
        </div>

        <div className="home__glow" />

        <div className="home__hero-content">
          <p className="home__badge">
            <span className="home__badge-icon" aria-hidden="true">✦</span>
            Panel de administración
          </p>

          <h1 className="home__title">
            Administra SIGEC
            <br />
            <span className="home__title-accent">
              desde un solo lugar
            </span>
          </h1>

          <p className="home__lead">
            Gestiona usuarios, espacios, solicitudes y listas de espera de
            manera sencilla desde tu panel administrativo.
          </p>

          {user && (
            <div className="admin__session">
              <span className="admin__session-email">{user.email}</span>
              <span className="admin__badge">{user.role}</span>
            </div>
          )}

          <div className="home__actions">
            <Link to="/admin/users" className="home__btn">
              Gestionar usuarios
            </Link>

            <Link
              to="/admin/properties"
              className="home__btn home__btn--ghost"
            >
              Ver espacios
            </Link>
          </div>
        </div>
      </section>

      {/* Panel administrativo */}
      <div className="home__body">
        <div className="home__container">
          <div className="home__panel">
            <div className="home__panel-bar">
              <span className="home__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>

              <span className="home__panel-title">
                Resumen de administración
              </span>

              <span className="home__panel-status">
                <span className="home__pulse" />
                En línea
              </span>
            </div>

            {/* Contadores */}
            <section className="home__summary" aria-label="Resumen administrativo">
              {summary.map((item) => (
                <article key={item.label} className="home__stat">
                  <span className="home__stat-icon">{item.icon}</span>
                  <span className="home__stat-value">{item.value}</span>
                  <span className="home__stat-label">{item.label}</span>
                </article>
              ))}
            </section>

            {/* Gráficas */}
            <section className="home__charts-section">
              <div className="home__charts-title">
                <p className="home__section-eyebrow">
                  Estadísticas generales
                </p>
                <h2 className="home__section-title">
                  Resumen visual de SIGEC
                </h2>
                <p className="home__charts-description">
                  Consulta la distribución de usuarios y espacios registrados.
                </p>
              </div>

              <div className="home__charts-grid">
                <DashboardChart
                  title="Usuarios"
                  subtitle="Distribución por rol"
                  icon={<UserRound size={20} />}
                  total={users.length}
                  data={usersData}
                  loading={usersLoading}
                  error={!!usersError}
                />

                <DashboardChart
                  title="Espacios"
                  subtitle="Distribución por estado"
                  icon={<BriefcaseBusiness size={20} />}
                  total={properties.length}
                  data={propertiesData}
                  loading={propertyLoading}
                  error={!!propertiesError}
                />
                <DashboardChart
                  title="Solicitudes"
                  subtitle="Distribución por estado"
                  icon={<ClipboardList size={20} />}
                  total={totalRequests}
                  data={requestsByStatus}
                  loading={requestsLoading}
                  error={!!requestsError}
                  emptyMessage="Todavía no hay solicitudes registradas."
                />
              </div>
            </section>

            {/* Accesos rápidos */}
            <section className="home__section">
              <p className="home__section-eyebrow">Accesos rápidos</p>
              <h2 className="home__section-title">
                ¿Qué deseas administrar?
              </h2>

              <div className="home__grid">
                {options.map((option) => (
                  <OptionCard key={option.title} {...option} />
                ))}
              </div>
            </section>
          </div>

          <footer className="home__footer">
            Sistema Integral de Gestión de Espacios Comerciales
          </footer>
        </div>
      </div>
      {confirmingLogout && (
        <ConfirmDialog
          title="Cerrar sesión"
          message="¿Estás seguro de que quieres salir de tu cuenta?"
          confirmLabel="Sí, cerrar sesión"
          cancelLabel="Cancelar"
          onConfirm={() => {
            setConfirmingLogout(false);
            logout();
          }}
          onCancel={() => setConfirmingLogout(false)}
        />
      )}
    </main>
  );
}
