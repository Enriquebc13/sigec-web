import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logoSigec from  "../../../../assets/logo-sigec.svg";
import "./AuthLayout.css";

type Props = {
  children: ReactNode;
};

export function AuthLayout({ children }: Props) {
  return (
    <main className="auth">
      {/* Lado izquierdo: marca */}
      <section className="auth__brand">
        <div className="auth__brand-content">
          <img src={logoSigec} alt="Logo de SIGEC" className="auth__logo-image" />
          <h1 className="auth__title">SIGEC</h1>
          <p className="auth__subtitle">
            Sistema Integral de Gestión de Espacios Comerciales
          </p>
        </div>
        <footer className="auth__footer">
          © 2026 MEGK · Orden que genera valor
        </footer>
      </section>

      {/* Lado derecho: lo que mande cada pantalla */}
      <section className="auth__panel">
        <Link to="/" className="auth__back">
        <ArrowLeft size={19} strokeWidth={2} />
          Volver al inicio
        </Link>
        <div className="auth__form-wrapper">{children}</div>
      </section>
    </main>
  );
}