import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ClipboardList,
  Clock3,
  User,
  ArrowRight,
  LogIn,
  LogOut,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";

import logoSigec from "../../../../assets/logo-sigec.svg";
import { HOME_BY_ROLE } from "../../../auth/presentation/home-by-role";
import { useAuth } from "../../../auth/presentation/hooks/useAuth";
import { PropertyCatalog } from "../../../properties/presentation/shared/PropertyCatalog";
import LoginBrand from "../../../../components/brand/LoginBrand";

import "./Landing.css";
import { RevealAll } from "../../../../components/Reveal";
import LoginGuide from "../../../../components/promo/LoginGuide";

const imageModules = import.meta.glob<string>(
  "../../../../assets/images/*.{png,jpg,jpeg,webp,avif}",
  { eager: true, query: "?url", import: "default" },
);

const slides = Object.entries(imageModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

// Lo que el visitante puede hacer con su cuenta
const features = [
  {
    icon: Search,
    title: "Explora los espacios",
    text: "Consulta locales, oficinas y bodegas disponibles. Revisa sus precios, ubicación, dimensiones y fotografías para encontrar el espacio que buscas.",
  },
  {
    icon: ClipboardList,
    title: "Muestra tu interés",
    text: "Selecciona las propiedades que te interesen, proporciona tus datos de contacto y envía tu solicitud para que un administrador pueda darle seguimiento.",
  },
  {
    icon: Clock3,
    title: "Consulta tu posición en la lista de espera",
    text: "Si varias personas están interesadas en una misma propiedad, podrás conocer el lugar que ocupas en la fila y consultar cómo avanza tu posición.",
  },
  {
    icon: User,
    title: "Da seguimiento a tus solicitudes",
    text: "Consulta el estado de tus solicitudes desde tu cuenta y mantente al tanto de su seguimiento. También puedes administrar tu información de perfil.",
  },
];

const steps = [
  {
    title: "Crea tu cuenta",
    text: "Regístrate gratis en unos minutos.",
  },
  {
    title: "Explora los espacios",
    text: "Revisa los locales, oficinas y bodegas disponibles.",
  },
  {
    title: "Selecciona uno de tu interés",
    text: "Consulta su información y elige el que mejor se adapte a ti.",
  },
  {
    title: "Envía una solicitud",
    text: "Muestra tu interés con un solo clic.",
  },
  {
    title: "Consulta su estado",
    text: "Da seguimiento desde el apartado “Mis solicitudes”.",
  },
];

const faqs = [
  {
    q: "¿Necesito una cuenta para ver los espacios?",
    a: "No. Puedes explorar el catálogo y consultar la información de los locales, oficinas y bodegas sin iniciar sesión. Para mostrar interés en una propiedad y dar seguimiento a tu solicitud, necesitas tener una cuenta.",
  },
  {
    q: "¿Cómo puedo solicitar un espacio?",
    a: "Ingresa al catálogo, selecciona la propiedad que te interese y utiliza la opción «Me interesa». Deberás proporcionar tus datos de contacto para que el administrador pueda dar seguimiento a tu solicitud. Después podrás consultar su estado desde el apartado «Mis solicitudes».",
  },
  {
    q: "¿Qué significa estar en lista de espera?",
    a: "Significa que personas han mostrado interés en una misma propiedad. El sistema organiza las solicitudes en una fila y te permite consultar el lugar que ocupas para que el administrador pueda atender a cada interesado en orden.",
  },
  {
    q: "¿Cómo funciona mi posición en la lista de espera?",
    a: "Puedes consultar tu lugar en la fila desde el apartado «Lista de espera». Si una persona que está antes que tú es rechazada o no continúa con el proceso, avanzarás automáticamente de posición.",
  },
  {
    q: "¿Qué pasa si la propiedad se renta antes de que llegue mi turno?",
    a: "Si la propiedad se renta antes de que puedas ser atendido, recibirás una notificación mediante los datos de contacto que proporcionaste al mostrar interés.",
  },
  {
    q: "¿Cómo sé cuándo es mi turno?",
    a: "Cuando llegues al primer lugar de la lista, el sistema te indicará que eres el siguiente y que un administrador se pondrá en contacto contigo. Puedes consultar esta información desde «Lista de espera».",
  },
  {
    q: "¿Puedo mostrar interés en diferentes espacios?",
    a: "Sí. Puedes mostrar interés en diferentes propiedades. Cada solicitud se registra individualmente y puedes consultar su seguimiento desde «Mis solicitudes» y «Lista de espera».",
  },
];

export function Landing() {
  const { user, logout } = useAuth();

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const panelPath = user ? HOME_BY_ROLE[user.role] : null;

  const next = useCallback(
    () => setCurrent((i) => (i + 1) % slides.length),
    [],
  );

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + slides.length) % slides.length),
    [],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;

    const id = window.setInterval(next, 5000);

    return () => window.clearInterval(id);
  }, [paused, next, current]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <RevealAll
      className="landing"
      selector={[
        ".landing__hero-content > :not(h1)", // sesión, tagline, botones, nota
        ".landing__title > span",            // las dos líneas del título
        ".landing__intro > *",               // logo animado + texto de bienvenida
        ".landing__section > h2",
        "#catalogo > :not(h2)",              // el catálogo completo
        ".landing__grid > *",                // tarjetas, en cascada
        ".landing__steps > *",               // pasos, en cascada
        ".landing__faq-list > *",
        ".landing__cta > *",
      ].join(", ")}
    >
      <header
        className={`landing__nav${scrolled ? " landing__nav--scrolled" : ""}`}
      >
        <Link to="/" className="landing__brand">
          <img src={logoSigec} alt="" width="40" height="40" />
          <span>SIGEC</span>
        </Link>

        <nav className="landing__links">
          <a href="#catalogo">Catálogo</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#preguntas">Preguntas</a>
          <Link to="/about">Acerca de</Link>
        </nav>

        {panelPath ? (
          <Link to={panelPath} className="landing__btn landing__btn--small">
            <LayoutDashboard size={17} />
            Ir a mi panel
          </Link>
        ) : (
          <div className="landing__nav-actions">
            <Link
              to="/login"
              className="landing__btn landing__btn--small landing__btn--ghost"
            >
              Iniciar sesión
            </Link>
            <Link to="/register" className="landing__btn landing__btn--small">
              Registrarse
            </Link>
          </div>
        )}
      </header>

      {!user && (
        <Link to="/register" className="landing__side-tab">
          Regístrate
        </Link>
      )}

      <section
        className="landing__hero"
        aria-roledescription="carrusel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="landing__slides" aria-hidden="true">
          {slides.map((src, i) => (
            <div
              key={src}
              className={`landing__slide${i === current ? " landing__slide--active" : ""
                }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        <div className="landing__overlay" />

        <div className="landing__hero-content">
          {user && (
            <div className="landing__session" role="status">
              <span className="landing__session-dot" aria-hidden="true" />
              <span className="landing__session-text">
                Tu sesión sigue activa como <strong>{user.email}</strong>
              </span>
            </div>
          )}

          <h1 className="landing__title">
            <span className="landing__title-top">Encuentra el espacio</span>
            <span className="landing__title-main">ideal para tu negocio</span>
          </h1>

          <p className="landing__tagline">
            Locales, oficinas y bodegas |{" "}
            <strong>Solicita y da seguimiento en línea</strong>
          </p>

          <div className="landing__actions">
            {panelPath ? (
              <>
                <Link to={panelPath} className="landing__btn">
                  Continuar a mi panel
                  <ArrowRight size={18} />
                </Link>

                <button
                  type="button"
                  className="landing__btn landing__btn--ghost"
                  onClick={logout}
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="landing__btn">
                  <UserPlus size={18} />
                  Regístrate
                </Link>

                <a
                  href="#catalogo"
                  className="landing__btn landing__btn--ghost"
                >
                  Ver catálogo
                  <ArrowRight size={18} />
                </a>
              </>
            )}
          </div>

          {!panelPath && (
            <p className="landing__hero-note">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          )}
        </div>

        {slides.length > 1 && (
          <div className="landing__controls">
            <button
              type="button"
              className="landing__arrow"
              onClick={prev}
              aria-label="Imagen anterior"
            >
              ‹
            </button>

            <div className="landing__dots">
              {slides.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={`landing__dot${i === current ? " landing__dot--active" : ""
                    }`}
                  onClick={() => setCurrent(i)}
                  aria-label={`Ir a la imagen ${i + 1}`}
                  aria-current={i === current}
                />
              ))}
            </div>

            <button
              type="button"
              className="landing__arrow"
              onClick={next}
              aria-label="Imagen siguiente"
            >
              ›
            </button>
          </div>
        )}
      </section>

      <div className="landing__body">
        <div className="landing__container">
          {/* ---------- Bienvenida: logo animado + texto ---------- */}
          <section className="landing__intro">
            <div className="landing__intro-brand">
              <LoginBrand size={260} showText={false} playOnView />
            </div>

            <div className="landing__intro-text">
              <p className="landing__eyebrow">Bienvenido a SIGEC</p>

              <h2>Rentar un espacio comercial, más fácil</h2>

              <p>
                SIGEC es el Sistema Integral de Gestión de Espacios
                Comerciales. Consulta los espacios disponibles, envía tus
                solicitudes y sigue tu lugar en la lista de espera, todo desde
                un solo sitio.
              </p>
            </div>
          </section>
                     <div style={{ width: "min(960px, 100%)", margin: "0 auto" }}>
              <LoginGuide />
            </div>

          <section id="catalogo" className="landing__section">
            <h2>Catálogo de propiedades</h2>
            <PropertyCatalog />
          </section>

          <section id="caracteristicas" className="landing__section">
            <h2>Qué puedes hacer con tu cuenta</h2>

            <div className="landing__grid">
              {features.map((f) => {
                const Icon = f.icon;

                return (
                  <article key={f.title} className="landing__card">
                    <span className="landing__card-icon" aria-hidden="true">
                      <Icon size={27} strokeWidth={1.8} />
                    </span>

                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="como-funciona" className="landing__section">
            <h2>Cómo funciona</h2>

            <ol className="landing__steps">
              {steps.map((s, i) => (
                <li key={s.title} className="landing__step">
                  <span className="landing__step-number">{i + 1}</span>

                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            id="preguntas"
            className="landing__section landing__section--narrow"
          >
            <h2>Preguntas frecuentes</h2>

            <div className="landing__faq-list">
              {faqs.map((faq) => (
                <details key={faq.q} className="landing__faq-item">
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="landing__cta">
            {panelPath ? (
              <>
                <h2>Tu sesión está activa</h2>
                <p>Sigue donde te quedaste en tu panel.</p>

                <Link to={panelPath} className="landing__btn">
                  Continuar a mi panel
                  <ArrowRight size={18} />
                </Link>
              </>
            ) : (
              <>
                <h2>¿Listo para encontrar tu espacio?</h2>
                <p>
                  Crea tu cuenta y empieza a enviar solicitudes hoy mismo.
                </p>

                <div className="landing__actions landing__actions--cta">
                  <Link to="/register" className="landing__btn">
                    <UserPlus size={18} />
                    Regístrate
                  </Link>

                  <Link to="/login" className="landing__btn landing__btn--ghost">
                    <LogIn size={18} />
                    Iniciar sesión
                  </Link>
                </div>
              </>
            )}
          </section>

          <footer className="landing__footer">
            © 2026 MEGK · Orden que genera valor
          </footer>
        </div>
      </div>
    </RevealAll>
  );
}