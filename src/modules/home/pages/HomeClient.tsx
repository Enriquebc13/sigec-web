import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ClipboardList,
  Clock3,
  UserRound,
  Info,
  Search,
  Star,
  Send,
  FileCheck,
  MapPin,
  Ruler,
  ArrowRight,
} from "lucide-react";

import logoSigec from "../../../assets/logo-sigec.svg";
import "./HomeClient.css";

import { useAuth } from "../../auth/presentation/hooks/useAuth";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { useUserProfile } from "../../users/presentation/admin/hooks/use-user-profile";
import { PropertyApiRepository } from "../../properties/infrastructure/repositories/property-api.repository";
import type { Property } from "../../properties/domain/entities/property.entity";
import { optimizedImage } from "../../properties/presentation/admin/image-url";
import { PROPERTY_TYPE_LABELS } from "../../properties/presentation/admin/property-labels";
import { useMyRequests } from "../../requests/presentation/client/hooks/use-my-requests";
import PromoAd from "../../../components/promo/PromoAd";

type Option = {
  icon: ElementType;
  label: string;
  title: string;
  description: string;
  to: string;
};

const options: Option[] = [
  {
    icon: Building2,
    label: "Espacios",
    title: "Espacios disponibles",
    description: "Consulta locales, oficinas y bodegas disponibles.",
    to: "/client/properties",
  },
  {
    icon: ClipboardList,
    label: "Solicitudes",
    title: "Mis solicitudes",
    description: "Revisa el estado de las solicitudes que has enviado.",
    to: "/client/requests",
  },
  {
    icon: Clock3,
    label: "Lista de espera",
    title: "Lista de espera",
    description: "Consulta tu posición en las listas de espera.",
    to: "/client/waitlist",
  },
  {
    icon: UserRound,
    label: "Perfil",
    title: "Mi perfil",
    description: "Administra tu información personal.",
    to: "/client/profile",
  },
  {
    icon: Info,
    label: "Acerca de",
    title: "Acerca de",
    description: "Conoce más sobre SIGEC y el equipo que lo desarrolla.",
    to: "/client/ClientAbout",
  },
];

const steps = [
  {
    icon: Search,
    title: "Explora los espacios",
    description: "Revisa los locales, oficinas y bodegas disponibles.",
  },
  {
    icon: Star,
    title: "Selecciona uno",
    description: "Elige el espacio que más se adapte a lo que buscas.",
  },
  {
    icon: Send,
    title: "Envía una solicitud",
    description: "Muestra tu interés con la opción “Me interesa”.",
  },
  {
    icon: FileCheck,
    title: "Consulta su estado",
    description: "Da seguimiento desde el apartado “Mis solicitudes”.",
  },
];

const helpItems = [
  {
    icon: ClipboardList,
    title: "Mis solicitudes",
    description: "Consulta el estado de cada solicitud que has enviado.",
    to: "/client/requests",
  },
  {
    icon: Clock3,
    title: "Lista de espera",
    description: "Revisa tu posición cuando un espacio no está disponible.",
    to: "/client/waitlist",
  },
  {
    icon: UserRound,
    title: "Mi perfil",
    description: "Consulta y actualiza tu información personal.",
    to: "/client/profile",
  },
];

const faqs = [
  {
    q: "¿Cómo puedo mostrar interés en un espacio?",
    a: "Ingresa al catálogo de propiedades, selecciona el local, oficina o bodega que te interese y utiliza la opción «Me interesa». Deberás proporcionar tus datos de contacto para que el administrador pueda comunicarse contigo y dar seguimiento a tu interés. Tu solicitud quedará registrada para que puedas consultarla posteriormente.",
  },
  {
    q: "¿Qué significa estar en lista de espera?",
    a: "Significa que varias personas han mostrado interés en una misma propiedad. El sistema organiza las solicitudes por orden de atención y te permite consultar la posición que ocupas en la fila desde el apartado «Lista de espera».",
  },
  {
    q: "¿Cómo funciona mi posición en la lista de espera?",
    a: "Tu posición puede avanzar cuando una persona que está delante de ti es rechazada o no continúa con el proceso. Cuando llegues al primer lugar, el sistema te indicará que eres el siguiente y que un administrador se pondrá en contacto contigo.",
  },
  {
    q: "¿Qué pasa si la propiedad se renta antes de que llegue mi turno?",
    a: "Si la propiedad se renta antes de que seas atendido, recibirás una notificación mediante los datos de contacto que proporcionaste al mostrar interés.",
  },
  {
    q: "¿Dónde puedo consultar mis solicitudes?",
    a: "Desde el apartado «Mis solicitudes» puedes consultar las propiedades en las que has mostrado interés y revisar el estado de cada una, para mantenerte al tanto de su seguimiento.",
  },
  {
    q: "¿Puedo mostrar interés en diferentes espacios?",
    a: "Sí. Puedes mostrar interés en diferentes propiedades. Cada solicitud se registra individualmente y podrás consultar su seguimiento desde «Mis solicitudes» y «Lista de espera».",
  },
];

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

/**
 * Los 3 espacios disponibles más recientes.
 */
function useFeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    new PropertyApiRepository()
      .findAll()
      .then((all: Property[]) => {
        if (cancelled) return;

        const latest = all
          .filter((p) => p.status === "AVAILABLE")
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
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

function OptionCard({ icon: Icon, title, description, to }: Option) {
  return (
    <Link to={to} className="client_home__card">
      <span className="client_home__card-icon" aria-hidden="true">
        <Icon size={26} strokeWidth={1.8} />
      </span>

      <span className="client_home__card-title">{title}</span>

      <span className="client_home__card-description">
        {description}
      </span>

      <span className="client_home__card-cta">
        Ir ahora <ArrowRight size={15} />
      </span>
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
          <span aria-hidden="true">
            <Building2 size={40} strokeWidth={1.6} />
          </span>
        )}

        <span className="client_home__space-tag">
          {PROPERTY_TYPE_LABELS[property.type]}
        </span>
      </div>

      <div className="client_home__space-body">
        <h3 className="client_home__space-name">{property.title}</h3>

        <div className="client_home__space-meta">
          <span>
            <MapPin size={15} strokeWidth={1.8} />
            {city}, {state}
          </span>

          {property.dimensions && (
            <span>
              <Ruler size={15} strokeWidth={1.8} />
              {property.dimensions}
            </span>
          )}
        </div>

        <span
          className="client_home__stat-value"
          style={{ fontSize: 24 }}
        >
          {money.format(property.price)}
        </span>

        <span className="client_home__card-cta">
          Ver espacio <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}

export function HomeClient() {
  const [scrolled, setScrolled] = useState(false);
  const { logout, user } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const userId = user?.id !== undefined ? String(user.id) : undefined;
  const { profile } = useUserProfile(userId);
  const firstName = profile?.name?.trim().split(" ")[0];

  const { properties: featured, loading: loadingFeatured } =
    useFeaturedProperties();

  // const {
  //   requests: myRequests,
  //   loading: requestsLoading,
  //   error: requestsError,
  // } = useMyRequests();

  // const summary = useMemo(() => {
  //   const places = myRequests
  //     .filter((r) => r.status === "PENDING")
  //     .map((r) => r.posicionListaEspera)
  //     .filter((p): p is number => p !== null);

  //   const waitingValue = requestsLoading
  //     ? "…"
  //     : requestsError
  //       ? "—"
  //       : String(places.length);

  //   const positionValue = requestsLoading
  //     ? "…"
  //     : places.length > 0
  //       ? `#${Math.min(...places)}`
  //       : "—";

  //   return [
  //     {
  //       icon: ClipboardList,
  //       label: "Solicitudes activas",
  //       value: waitingValue,
  //     },
  //     {
  //       icon: Clock3,
  //       label: "Posición en lista de espera",
  //       value: positionValue,
  //     },
  //     {
  //       icon: Building2,
  //       label: "Espacios disponibles",
  //       value: "—",
  //     },
  //   ];
  // }, [myRequests, requestsLoading, requestsError]);

  const greeting = useMemo(
    () => (firstName ? `¡Hola, ${firstName}!` : "¡Hola!"),
    [firstName],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="client_home">
      {/* ---------- Navbar ---------- */}
      <header
        className={`client_home__nav${
          scrolled ? " client_home__nav--scrolled" : ""
        }`}
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

      {/* ---------- Anuncio (sección independiente) ---------- */}
      <section className="client_home__promo-section">
        <div className="client_home__promo">
          <PromoAd />
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

              {/* <span className="client_home__panel-title">

                Resumen de tu cuenta
              </span> */}

              <span className="client_home__panel-status">
                <span
                  className="client_home__pulse"
                  aria-hidden="true"
                />
                En línea
              </span>
            </div>

            {/* <section
              className="client_home__summary"
              aria-label="Resumen"
            >
              {summary.map((s) => {
                const Icon = s.icon;

                return (
                  <article key={s.label} className="client_home__stat">
                    <span
                      className="client_home__stat-icon"
                      aria-hidden="true"
                    >
                      <Icon size={22} strokeWidth={1.8} />
                    </span>

                    <span className="client_home__stat-value">
                      {s.value}
                    </span>

                    <span className="client_home__stat-label">
                      {s.label}
                    </span>
                  </article>
                );
              })}
            </section> */}

            <section className="client_home__section">
              <p className="client_home__section-eyebrow">
                Accesos rápidos
              </p>

              <h2 className="client_home__section-title">
                ¿Qué deseas hacer?
              </h2>

              <div className="client_home__grid">
                {options.map((option) => (
                  <OptionCard key={option.title} {...option} />
                ))}
              </div>
            </section>
          </div>

          {/* ---------- Espacios destacados ---------- */}
          <section className="client_home__featured">
            <p className="client_home__section-eyebrow">
              Recién publicados
            </p>

            <h2 className="client_home__section-title">
              Espacios destacados
            </h2>

            <div className="client_home__featured-grid">
              {loadingFeatured && (
                <p className="client_home__catalog-description">
                  Cargando espacios…
                </p>
              )}

              {!loadingFeatured &&
                featured.map((p) => (
                  <FeaturedSpace key={p.id} property={p} />
                ))}

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
                  <ArrowRight size={30} strokeWidth={1.8} />
                </span>

                <span className="client_home__space-name">
                  Ver todos
                </span>

                <span className="client_home__card-description">
                  Explora el catálogo completo de espacios.
                </span>
              </Link>
            </div>
          </section>

          {/* ---------- ¿Cómo funciona? ---------- */}
          <section className="client_home__how">
            <p className="client_home__section-eyebrow">
              Paso a paso
            </p>

            <h2 className="client_home__section-title">
              ¿Cómo funciona SIGEC?
            </h2>

            <ol className="client_home__steps">
              {steps.map((step, i) => {
                const Icon = step.icon;

                return (
                  <li key={step.title} className="client_home__step">
                    <span
                      className="client_home__step-num"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>

                    <span
                      className="client_home__step-icon"
                      aria-hidden="true"
                    >
                      <Icon size={25} strokeWidth={1.8} />
                    </span>

                    <h3 className="client_home__step-title">
                      {step.title}
                    </h3>

                    <p className="client_home__card-description">
                      {step.description}
                    </p>
                  </li>
                );
              })}
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
                {helpItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="client_home__help-item"
                    >
                      <span
                        className="client_home__help-icon"
                        aria-hidden="true"
                      >
                        <Icon size={22} strokeWidth={1.8} />
                      </span>

                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.description}</small>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ---------- Preguntas frecuentes (desplegables) ---------- */}
          <section
            className="client_home__faq client_home__container--narrow"
            style={{ margin: "0 auto" }}
          >
            <p className="client_home__section-eyebrow">
              Dudas comunes
            </p>

            <h2 className="client_home__section-title">
              Preguntas frecuentes
            </h2>

            <div className="client_home__faq-list">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="client_home__faq-item"
                >
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