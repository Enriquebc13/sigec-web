import { useMemo, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Building2,
  ClipboardList,
  Hourglass,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import logoSigec from "../../../assets/logo-sigec.svg";
import "./HomeAdmin.css";
import { useAuth } from "../../auth/presentation/hooks/useAuth";
import { useUsers } from "../../users/presentation/admin/hooks/use-users";
import { useProperties } from "../../properties/presentation/admin/hooks/use-properties";
import { useRequestHistory } from "../../requests/presentation/admin/hooks/use-request-history";
import { ConfirmDialog } from "../../../components/ConfirmDialog";

const COLORS = {
  purple: "#8559f0",
  lavender: "#c9b3ff",
  teal: "#49b6ad",
  blue: "#5478d5",
  gray: "#777080",
};

const nav = [
  { to: "/admin/home", label: "Inicio", icon: LayoutDashboard },
  { to: "/admin/users", label: "Usuarios", icon: Users },
  { to: "/admin/properties", label: "Espacios", icon: Building2 },
  { to: "/admin/requests", label: "Solicitudes", icon: ClipboardList },
  { to: "/admin/waitlist", label: "Listas de espera", icon: Hourglass },
  { to: "/admin/reports", label: "Reportes", icon: TrendingUp },
  { to: "/admin/profile", label: "Mi perfil", icon: UserRound },
];

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

type PanelState = "loading" | "error" | "ok";

const panelState = (loading: boolean, error: boolean): PanelState =>
  loading ? "loading" : error ? "error" : "ok";

const show = (value: number, loading: boolean, error: boolean) =>
  loading ? "…" : error ? "—" : String(value);

function Panel({
  title,
  subtitle,
  state,
  children,
}: {
  title: string;
  subtitle: string;
  state: PanelState;
  children: ReactNode;
}) {
  return (
    <section className="dash__panel">
      <header className="dash__panel-head">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      {state === "loading" ? (
        <p className="dash__msg">Cargando información…</p>
      ) : state === "error" ? (
        <p className="dash__msg">No se pudo cargar la información.</p>
      ) : (
        children
      )}
    </section>
  );
}

function Bars({
  rows,
}: {
  rows: { name: string; value: number; color: string }[];
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <ul className="dash__bars">
      {rows.map((row) => {
        const pct = total ? Math.round((row.value / total) * 100) : 0;

        return (
          <li key={row.name}>
            <div className="dash__bar-top">
              <span>{row.name}</span>
              <strong>
                {row.value} <small>({pct}%)</small>
              </strong>
            </div>
            <div className="dash__track">
              <span style={{ width: `${pct}%`, background: row.color }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Ring({ percent }: { percent: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="dash__ring">
      <svg viewBox="0 0 120 120" role="img" aria-label={`${percent}% ocupado`}>
        <circle className="dash__ring-bg" cx="60" cy="60" r={radius} />
        <circle
          className="dash__ring-fg"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div>
        <strong>{percent}%</strong>
        <span>ocupado</span>
      </div>
    </div>
  );
}

export function HomeAdmin() {
  const { user, logout } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const { users, loading: usersLoading, error: usersError } = useUsers();
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

  // Última versión de cada solicitud + conteo por estado + lista reciente
  const { requestsByStatus, recent, totalRequests, pending } = useMemo(() => {
    const latest = new Map<string, (typeof history)[number]>();

    history.forEach((event) => {
      const current = latest.get(event.requestId);

      if (
        !current ||
        new Date(event.changedAt).getTime() >
          new Date(current.changedAt).getTime()
      ) {
        latest.set(event.requestId, event);
      }
    });

    const list = Array.from(latest.values()).sort(
      (a, b) =>
        new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
    );
    const count = (status: string) =>
      list.filter((item) => item.request.status === status).length;

    return {
      requestsByStatus: [
        { name: "Pendientes", value: count("PENDING"), color: COLORS.purple },
        { name: "Aprobadas", value: count("APPROVED"), color: COLORS.teal },
        { name: "Rechazadas", value: count("REJECTED"), color: COLORS.gray },
      ],
      recent: list.slice(0, 5),
      totalRequests: list.length,
      pending: count("PENDING"),
    };
  }, [history]);

  // Movimientos del historial por mes (últimos 6 meses)
  const activity = useMemo(() => {
    const monthName = new Intl.DateTimeFormat("es-MX", { month: "short" });
    const now = new Date();

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: monthName.format(d).replace(".", ""),
        total: 0,
      };
    });

    history.forEach((event) => {
      const d = new Date(event.changedAt);
      const month = months.find(
        (m) => m.key === `${d.getFullYear()}-${d.getMonth()}`,
      );
      if (month) month.total += 1;
    });

    return months;
  }, [history]);

  const propertiesData = [
    {
      name: "Disponibles",
      value: properties.filter((p) => p.status === "AVAILABLE").length,
      color: COLORS.teal,
    },
    {
      name: "Reservados",
      value: properties.filter((p) => p.status === "RESERVED").length,
      color: COLORS.lavender,
    },
    {
      name: "Rentados",
      value: properties.filter((p) => p.status === "RENTED").length,
      color: COLORS.purple,
    },
    {
      name: "No disponibles",
      value: properties.filter((p) => p.status === "UNAVAILABLE").length,
      color: COLORS.gray,
    },
  ];

  const occupied = propertiesData[1].value + propertiesData[2].value;
  const occupancy = properties.length
    ? Math.round((occupied / properties.length) * 100)
    : 0;

  const stats = [
    {
      tone: "teal",
      icon: <Users size={22} />,
      value: show(users.length, usersLoading, !!usersError),
      label: "Usuarios registrados",
      cta: "Ver usuarios",
      to: "/admin/users",
    },
    {
      tone: "blue",
      icon: <Building2 size={22} />,
      value: show(properties.length, propertyLoading, !!propertiesError),
      label: "Espacios registrados",
      cta: "Ver espacios",
      to: "/admin/properties",
    },
    {
      tone: "purple",
      icon: <ClipboardList size={22} />,
      value: show(pending, requestsLoading, !!requestsError),
      label: "Solicitudes pendientes",
      cta: "Revisar solicitudes",
      to: "/admin/requests",
    },
  ];

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const requestsState = panelState(requestsLoading, !!requestsError);
  const propertiesState = panelState(propertyLoading, !!propertiesError);

  return (
    <div className="dash">
      {/* Barra lateral */}
      <aside className="dash__side">
        <Link to="/admin/home" className="dash__brand">
          <img src={logoSigec} alt="" />
          <span>SIGEC</span>
        </Link>

        {user && (
          <div className="dash__me">
            <span className="dash__avatar" aria-hidden="true">
              {user.email.charAt(0).toUpperCase()}
            </span>
            <div>
              <span className="dash__me-mail">{user.email}</span>
              <span className="dash__role">
                {user.role === "ADMIN" ? "Administrador" : user.role}
              </span>
            </div>
          </div>
        )}

        <nav className="dash__nav" aria-label="Navegación del administrador">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `dash__link${isActive ? " dash__link--active" : ""}`
              }
            >
              <Icon size={19} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="dash__logout"
          onClick={() => setConfirmingLogout(true)}
        >
          <LogOut size={19} aria-hidden="true" />
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido */}
      <main className="dash__main">
        <header className="dash__head">
          <h1>Panel de administración</h1>
          <p>Hoy es {today}. Esto es lo que pasa en SIGEC.</p>
        </header>

        <section className="dash__stats" aria-label="Resumen">
          {stats.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`dash__stat dash__stat--${item.tone}`}
            >
              <span className="dash__stat-icon">{item.icon}</span>
              <span className="dash__stat-value">{item.value}</span>
              <span className="dash__stat-label">{item.label}</span>
              <span className="dash__stat-cta">{item.cta}</span>
            </Link>
          ))}
        </section>

        <div className="dash__row dash__row--2">
          <Panel
            title="Solicitudes recientes"
            subtitle="Las últimas que cambiaron de estado"
            state={requestsState}
          >
            {recent.length === 0 ? (
              <p className="dash__msg">
                Todavía no hay solicitudes. Cuando un cliente se interese en un
                espacio, aparecerá aquí.
              </p>
            ) : (
              <ul className="dash__recent">
                {recent.map((event) => (
                  <li key={event.id}>
                    <div className="dash__recent-who">
                      <span>
                        {event.request.user.name} {event.request.user.lastname}
                      </span>
                      <small>
                        {new Date(event.changedAt).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                        })}
                      </small>
                    </div>
                    <span
                      className={`dash__chip dash__chip--${event.request.status.toLowerCase()}`}
                    >
                      {statusLabels[event.request.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Movimiento de solicitudes"
            subtitle="Cambios registrados en los últimos 6 meses"
            state={requestsState}
          >
            <div className="dash__chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activity}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={COLORS.purple}
                        stopOpacity={0.55}
                      />
                      <stop
                        offset="100%"
                        stopColor={COLORS.purple}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(255,255,255,.07)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9b93ad", fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    width={32}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9b93ad", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#171020",
                      border: "1px solid rgba(201,179,255,.2)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Movimientos"
                    stroke={COLORS.lavender}
                    strokeWidth={2.5}
                    fill="url(#dashArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="dash__row dash__row--3">
          <Panel
            title="Espacios por estado"
            subtitle={`${properties.length} espacios en total`}
            state={propertiesState}
          >
            <Bars rows={propertiesData} />
          </Panel>

          <Panel
            title="Solicitudes por estado"
            subtitle={`${totalRequests} solicitudes en total`}
            state={requestsState}
          >
            <Bars rows={requestsByStatus} />
          </Panel>

          <Panel
            title="Ocupación"
            subtitle="Espacios rentados o reservados"
            state={propertiesState}
          >
            <Ring percent={occupancy} />
            <p className="dash__ring-note">
              {occupied} de {properties.length} espacios
            </p>
          </Panel>
        </div>
      </main>

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
    </div>
  );
}