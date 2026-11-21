
// import { Link } from "react-router-dom";
import {
  Target,
  Telescope,
  Building2,
  ClipboardList,
  ShieldCheck,
  Code2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import logoSigec from "../../../../assets/logo-sigec.svg";
import "./About.css";
import { GlowScreen } from "../../../../components/GlowScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";

// type Props = {
//   /** Ruta a la que regresa el botón Volver */
//   backTo?: string;
// };

type InfoItem = {
  icon: LucideIcon;
  title: string;
  text: string;
};

const purpose: InfoItem[] = [
  {
    icon: Target,
    title: "Misión",
    text: "Facilitar la gestión de espacios comerciales mediante una plataforma web que centralice la información de locales, oficinas y bodegas, simplifique el seguimiento de solicitudes y organice las listas de espera, ofreciendo un servicio eficiente, seguro y accesible.",
  },
  {
    icon: Telescope,
    title: "Visión",
    text: "Ser una plataforma de referencia en la gestión de espacios comerciales, reconocida por optimizar los procesos de administración, mejorar la atención a los interesados y ofrecer una experiencia confiable, organizada y transparente.",
  },
];

const highlights: InfoItem[] = [
  {
    icon: Building2,
    title: "Gestión de espacios",
    text: "Locales, oficinas y bodegas administrados desde un solo lugar, con su información siempre al día.",
  },
  {
    icon: ClipboardList,
    title: "Solicitudes y listas de espera",
    text: "Muestra interés en los espacios disponibles y proporciona tus datos de contacto. Si varias personas están interesadas en una misma propiedad, SIGEC organiza las solicitudes por orden de atención y te permite consultar tu posición en la fila.",
  },
  {
    icon: ShieldCheck,
    title: "Organización y seguridad",
    text: "Información centralizada y procesos organizados para brindar una experiencia confiable y facilitar la gestión de los espacios comerciales.",
  },
];

const stack = [
  "React",
  "TypeScript",
  "Vite",
  "NestJS",
  "Prisma",
  "MySQL",
  "JWT",
  "Docker",
  "Swagger",
];

const team = [
  { name: "Enrique Báez Cruz", role: "Frontend" },
  { name: "Martín Sánchez Herrera", role: "Backend" },
  { name: "Gerardo Cortés Pastrana", role: "Full stack" },
  { name: "Kevin Licona Silva", role: "Tester" },
];

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

export function ClientAbout() {
  return (
    <GlowScreen wide>
      <RoleNav />

      <main className="about__container">
        {/* ---------- Hero ---------- */}
        <section className="about__hero">
          <div className="about__hero-text">
            <p className="about__eyebrow">Acerca de</p>

            <h1 className="about__title">SIGEC</h1>

            <p className="about__subtitle">
              Sistema Integral de Gestión de Espacios Comerciales
            </p>

            <p className="about__lead">
              SIGEC es una plataforma web diseñada para facilitar la administración de locales,
              oficinas y bodegas.Permite consultar los espacios disponibles, registrar el interés de
              las personas y organizar el seguimiento de las solicitudes mediante listas de espera, manteniendo
              la información centralizada y facilitando la gestión de los espacios comerciales.
            </p>
          </div>

          <div className="about__hero-logo">
            <img src={logoSigec} alt="Logo de SIGEC" />
          </div>
        </section>

        {/* ---------- Misión y Visión ---------- */}
        <section className="about__section">
          <div className="about__purpose">
            {purpose.map((p) => {
              const Icon = p.icon;

              return (
                <article key={p.title} className="about__purpose-card">
                  <div className="about__purpose-head">
                    <span className="about__card-icon" aria-hidden="true">
                      <Icon size={27} strokeWidth={1.8} />
                    </span>

                    <h2 className="about__purpose-title">{p.title}</h2>
                  </div>

                  <p>{p.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ---------- Qué ofrece ---------- */}
        <section className="about__section">
          <h2 className="about__heading">Qué ofrece</h2>

          <div className="about__grid">
            {highlights.map((h) => {
              const Icon = h.icon;

              return (
                <article key={h.title} className="about__card">
                  <span className="about__card-icon" aria-hidden="true">
                    <Icon size={28} strokeWidth={1.8} />
                  </span>

                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ---------- Tecnología ---------- */}
        <section className="about__section">
          <h2 className="about__heading">Tecnología</h2>

          <ul className="about__chips">
            {stack.map((tech) => (
              <li key={tech} className="about__chip">
                <Code2 size={16} strokeWidth={1.8} />
                <span>{tech}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Equipo ---------- */}
        <section className="about__section">
          <div className="about__team-heading">
            <UsersRound size={23} strokeWidth={1.8} />
            <p className="about__eyebrow about__eyebrow--center">
              Equipo MEGK
            </p>
          </div>

          <div className="about__team">
            {team.map((member) => (
              <article key={member.name} className="about__member">
                <span className="about__avatar" aria-hidden="true">
                  {initials(member.name)}
                </span>

                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Footer ---------- */}
        <footer className="about__footer">
          © 2026 MEGK · Orden que genera valor
        </footer>
      </main>
    </GlowScreen>
  );
}
