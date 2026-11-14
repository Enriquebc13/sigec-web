import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import logoSigec from "../../../assets/logo-sigec.svg";
import "./HomeClient.css";
import { useAuth } from "../../auth/presentation/hooks/useAuth";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { useUserProfile } from "../../users/presentation/admin/hooks/use-user-profile";
import { PropertyApiRepository } from "../../properties/infrastructure/repositories/property-api.repository";
import type { Property } from "../../properties/domain/entities/property.entity";
import { optimizedImage } from "../../properties/presentation/admin/image-url";
import { PROPERTY_TYPE_LABELS } from "../../properties/presentation/admin/property-labels";

type Option = {
  icon: string;
  label: string;
  title: string;
  description: string;
  to: string;
};

const options: Option[] = [
  {
    icon: "🏢",
    label: "Espacios",
    title: "Espacios disponibles",
    description: "Consulta locales, oficinas y bodegas disponibles.",
    to: "/client/properties",
  },
  {
    icon: "📨",
    label: "Solicitudes",
    title: "Mis solicitudes",
    description: "Revisa el estado de las solicitudes que has enviado.",
    to: "/client/requests",
  },
  {
    icon: "⏳",
    label: "Lista de espera",
    title: "Lista de espera",
    description: "Consulta tu posición en las listas de espera.",
    to: "/client/waitlist",
  },
  {
    icon: "👤",
    label: "Perfil",
    title: "Mi perfil",
    description: "Administra tu información personal.",
    to: "/client/profile",
  },
  {
    icon: "ℹ️",
    label: "Acerca de",
    title: "Acerca de",
    description: "Conoce más sobre SIGEC y el equipo que lo desarrolla.",
    to: "/client/ClientAbout",
  },
];

// TODO: reemplazar los "—" con datos reales cuando se conecte la API
const summary = [
  { icon: "📨", label: "Solicitudes activas", value: "—" },
  { icon: "⏳", label: "Posición en lista de espera", value: "—" },
  { icon: "🏢", label: "Espacios disponibles", value: "—" },
];

const steps = [
  {
    icon: "🔎",
    title: "Explora los espacios",
    description: "Revisa los locales, oficinas y bodegas disponibles.",
  },
  {
    icon: "⭐",
    title: "Selecciona uno",
    description: "Elige el espacio que más se adapte a lo que buscas.",
  },
  {
    icon: "📨",
    title: "Envía una solicitud",
    description: "Muestra tu interés con la opción “Me interesa”.",
  },
  {
    icon: "📋",
    title: "Consulta su estado",
    description: "Da seguimiento desde el apartado “Mis solicitudes”.",
  },
];

const helpItems = [
  {
    icon: "📨",
    title: "Mis solicitudes",
    description: "Consulta el estado de cada solicitud que has enviado.",
    to: "/client/requests",
  },
  {
    icon: "⏳",
    title: "Lista de espera",
    description: "Revisa tu posición cuando un espacio no está disponible.",
    to: "/client/waitlist",
  },
  {
    icon: "👤",
    title: "Mi perfil",
    description: "Consulta y actualiza tu información personal.",
    to: "/client/profile",
  },
];

const faqs = [
  {
    q: "¿Cómo puedo solicitar un espacio?",
    a: "Para solicitar un espacio, primero ingresa al catálogo de espacios disponibles. Selecciona el local, oficina o bodega que te interese y consulta su información. Si deseas rentarlo, utiliza la opción para enviar una solicitud. Una vez enviada, podrás consultar su estado desde el apartado “Mis solicitudes”.",
  },
  {
    q: "¿Qué significa estar en lista de espera?",
    a: "Significa que has mostrado interés en un espacio que actualmente no se encuentra disponible y tu solicitud queda registrada para cuando exista disponibilidad. Puedes consultar tu posición en la lista de espera desde el apartado correspondiente. Cuando el espacio vuelva a estar disponible, se podrá dar seguimiento a las personas registradas según su posición.",
  },
  {
    q: "¿Dónde consulto mis solicitudes?",
    a: "Puedes consultar todas tus solicitudes desde el apartado “Mis solicitudes”, donde encontrarás la información de cada espacio que has solicitado y el estado en el que se encuentra. Así podrás dar seguimiento sin necesidad de realizar una nueva solicitud.",
  },
  {
    q: "¿Puedo enviar solicitudes para diferentes espacios?",
    a: "Sí, puedes mostrar interés en diferentes espacios y enviar solicitudes para aquellos que sean de tu interés. Cada solicitud podrá consultarse individualmente desde el apartado “Mis solicitudes”, lo que te permitirá llevar un seguimiento organizado.",
  },
];

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

/**
 * Los 3 espacios disponibles más recientes.
 * ⚠️ AJUSTA la línea marcada con (*) al método real de tu repositorio
 *    (el mismo que usa PropertyCatalog para traer la lista).
 */
function useFeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    new PropertyApiRepository()
      .findAll() // (*) cambia "findAll" si tu método se llama distinto
      .then((all: Property[]) => {
        if (cancelled) return;
        const latest = all
          .filter((p) => p.status === "AVAILABLE")
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 3);
        setProperties(latest);
      })
      .catch(() => {
        if (!cancelled) setProperties([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { properties, loading };
}

function OptionCard({ icon, title, description, to }: Option) {
  return (
    <Link to={to} className="client_home__card">
      <span className="client_home__card-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="client_home__card-title">{title}</span>
      <span className="client_home__card-description">{description}</span>
      <span className="client_home__card-cta">Ir ahora →</span>
    </Link>
  );
}

function FeaturedSpace({ property }: { property: Property }) {
  const cover = property.images[0];
  const { city, state } = property.address;

  return (
    <Link to="/client/properties" className="client_home__space">
      <div className="client_home__space-media">
        {cover ? (
          <img
            src={optimizedImage(cover.url, 480)}
            alt={property.title}
            loading="lazy"
          />
        ) : (
          <span aria-hidden="true">🏢</span>
        )}
        <span className="client_home__space-tag">
          {PROPERTY_TYPE_LABELS[property.type]}
        </span>
      </div>

      <div className="client_home__space-body">
        <h3 className="client_home__space-name">{property.title}</h3>
        <div className="client_home__space-meta">
          <span>📍 {city}, {state}</span>
          {property.dimensions && <span>📐 {property.dimensions}</span>}
        </div>
        <span className="client_home__stat-value" style={{ fontSize: 24 }}>
          {money.format(property.price)}
        </span>
        <span className="client_home__card-cta">Ver espacio →</span>
      </div>
    </Link>
  );
}

export function HomeClient() {
  const [scrolled, setScrolled] = useState(false);
  const { logout, user } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  // ⚠️ Si tu useAuth expone el id de otra forma, ajústalo aquí
  const userId = user?.id !== undefined ? String(user.id) : undefined;
  const { profile } = useUserProfile(userId);
  const firstName = profile?.name?.trim().split(" ")[0];

  const { properties: featured, loading: loadingFeatured } =
    useFeaturedProperties();

  const greeting = useMemo(
    () => (firstName ? `¡Hola, ${firstName}!` : "¡Hola!"),
    [firstName],
  );

  // Navbar transparente arriba, con cristal al hacer scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="client_home">
      {/* ---------- Navbar ---------- */}
      <header
        className={`client_home__nav${scrolled ? " client_home__nav--scrolled" : ""}`}
      >
        <Link to="/client/home" className="client_home__brand">
          <img src={logoSigec} alt="" width="36" height="36" />
          <span>SIGEC</span>
        </Link>

        <nav className="client_home__links">
          <Link to="/client/home" className="client_home__link--active">
            Inicio
          </Link>
          {options.map((o) => (
            <Link key={o.to} to={o.to}>
              {o.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="client_home__logout"
          onClick={() => setConfirmingLogout(true)}
        >
          Cerrar sesión
        </button>
      </header>

      {/* ---------- Hero con bienvenida personalizada ---------- */}
      <section className="client_home__hero">
        <div className="client_home__rays" aria-hidden="true" />

        <div className="client_home__building" aria-hidden="true">
          <img src={logoSigec} alt="" />
        </div>

        <div className="client_home__glow" aria-hidden="true" />

        <div className="client_home__hero-content">
          <h1 className="client_home__title">
            {greeting}
            <br />
            <span className="client_home__title-accent">
              Encuentra el espacio que estás buscando
            </span>
          </h1>

          <p className="client_home__lead">
            Consulta los espacios disponibles, da seguimiento a tus solicitudes
            y revisa tu posición en las listas de espera, todo en un solo lugar.
          </p>

          <div className="client_home__actions">
            <Link to="/client/properties" className="client_home__btn">
              Ver espacios
            </Link>

            <Link
              to="/client/requests"
              className="client_home__btn client_home__btn--ghost"
            >
              Mis solicitudes
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Panel (estilo dashboard) ---------- */}
      <div className="client_home__body">
        <div className="client_home__container">
          <div className="client_home__panel">
            <div className="client_home__panel-bar">
              <span className="client_home__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="client_home__panel-title">
                Resumen de tu cuenta
              </span>
              <span className="client_home__panel-status">
                <span className="client_home__pulse" aria-hidden="true" />
                En línea
              </span>
            </div>

            <section className="client_home__summary" aria-label="Resumen">
              {summary.map((s) => (
                <article key={s.label} className="client_home__stat">
                  <span className="client_home__stat-icon" aria-hidden="true">
                    {s.icon}
                  </span>
                  <span className="client_home__stat-value">{s.value}</span>
                  <span className="client_home__stat-label">{s.label}</span>
                </article>
              ))}
            </section>

            <section className="client_home__section">
              <p className="client_home__section-eyebrow">Accesos rápidos</p>
              <h2 className="client_home__section-title">¿Qué deseas hacer?</h2>

              <div className="client_home__grid">
                {options.map((option) => (
                  <OptionCard key={option.title} {...option} />
                ))}
              </div>
            </section>
          </div>

          {/* ---------- Espacios destacados ---------- */}
          <section className="client_home__featured">
            <p className="client_home__section-eyebrow">Recién publicados</p>
            <h2 className="client_home__section-title">Espacios destacados</h2>

            <div className="client_home__featured-grid">
              {loadingFeatured && (
                <p className="client_home__catalog-description">
                  Cargando espacios…
                </p>
              )}

              {!loadingFeatured &&
                featured.map((p) => <FeaturedSpace key={p.id} property={p} />)}

              {!loadingFeatured && featured.length === 0 && (
                <p className="client_home__catalog-description">
                  Por ahora no hay espacios disponibles.
                </p>
              )}

              <Link
                to="/client/properties"
                className="client_home__space client_home__space--all"
              >
                <span
                  className="client_home__space-all-icon"
                  aria-hidden="true"
                >
                  →
                </span>
                <span className="client_home__space-name">Ver todos</span>
                <span className="client_home__card-description">
                  Explora el catálogo completo de espacios.
                </span>
              </Link>
            </div>
          </section>

          {/* ---------- ¿Cómo funciona? ---------- */}
          <section className="client_home__how">
            <p className="client_home__section-eyebrow">Paso a paso</p>
            <h2 className="client_home__section-title">¿Cómo funciona SIGEC?</h2>

            <ol className="client_home__steps">
              {steps.map((step, i) => (
                <li key={step.title} className="client_home__step">
                  <span className="client_home__step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="client_home__step-icon" aria-hidden="true">
                    {step.icon}
                  </span>
                  <h3 className="client_home__step-title">{step.title}</h3>
                  <p className="client_home__card-description">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------- Información de ayuda ---------- */}
          <section className="client_home__help">
            <div className="client_home__help-box">
              <div className="client_home__help-head">
                <p
                  className="client_home__section-eyebrow"
                  style={{ textAlign: "left" }}
                >
                  Ayuda
                </p>
                <h2 className="client_home__section-title client_home__section-title--left">
                  ¿Necesitas orientación?
                </h2>
                <p className="client_home__catalog-description">
                  Aquí puedes encontrar rápidamente lo que necesitas para dar
                  seguimiento a tu cuenta.
                </p>
              </div>

              <div className="client_home__help-list">
                {helpItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="client_home__help-item"
                  >
                    <span
                      className="client_home__help-icon"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ---------- Preguntas frecuentes (desplegables) ---------- */}
          <section className="client_home__faq client_home__container--narrow" style={{ margin: "0 auto" }}>
            <p className="client_home__section-eyebrow">Dudas comunes</p>
            <h2 className="client_home__section-title">Preguntas frecuentes</h2>

            <div className="client_home__faq-list">
              {faqs.map((faq) => (
                <details key={faq.q} className="client_home__faq-item">
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <footer className="client_home__footer">
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
    </div>
  );
}