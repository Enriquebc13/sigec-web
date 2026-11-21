import type { CSSProperties } from "react";
import "./LoginGuide.css";

type Props = { className?: string };

// Permite pasar variables CSS (--d, --s, --n) en style sin errores de TypeScript
const vars = (o: Record<string, string | number>) => o as CSSProperties;

/**
 * Anuncio animado que explica cómo iniciar sesión (16 s, en bucle).
 * Solo CSS. Úsalo dentro de un contenedor con ancho definido, por ejemplo:
 *   <div style={{ width: "min(960px, 100%)", margin: "0 auto" }}><LoginGuide /></div>
 */
export default function LoginGuide({ className = "" }: Props) {
  return (
    <div
      className={`lg ${className}`.trim()}
      role="img"
      aria-label="Cómo iniciar sesión en SIGEC: escribe tu correo y contraseña, pulsa Iniciar sesión, verificamos tus datos y entras a tu panel"
    >
      <div className="lg-orb lg-o1" />
      <div className="lg-orb lg-o2" />
      <div className="lg-orb lg-o3" />

      {/* Escena 1: escribir datos */}
      <section className="lg-scene" style={vars({ "--d": "0s" })}>
        <p className="lg-mid lg-in">Escribe tu correo y contraseña</p>
        <div className="lg-card lg-in" style={vars({ "--s": ".2s" })}>
          <div className="lg-field">
            <small>Correo</small>
            <span className="lg-type" style={vars({ "--n": 18, "--o": ".5s" })}>
              correo@ejemplo.com
            </span>
          </div>
          <div className="lg-field">
            <small>Contraseña</small>
            <span className="lg-type" style={vars({ "--n": 8, "--o": "1.6s" })}>
              ••••••••
            </span>
          </div>
        </div>
      </section>

      {/* Escena 2: pulsar el botón */}
      <section className="lg-scene" style={vars({ "--d": "4s" })}>
        <p className="lg-mid lg-in">Pulsa «Iniciar sesión»</p>
        <div className="lg-btnwrap lg-in" style={vars({ "--s": ".2s" })}>
          <div className="lg-btn">Iniciar sesión</div>
          <svg className="lg-cursor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 3l15 7.5-6.5 1.8L9.7 19z"
              fill="#fff"
              stroke="#1a0b2e"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* Escena 3: verificación */}
      <section className="lg-scene" style={vars({ "--d": "8s" })}>
        <div className="lg-badge lg-in">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <g className="lg-ring">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="8" />
              <circle
                className="lg-spin"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#ffc857"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="60 200"
              />
            </g>
            <g className="lg-ok">
              <circle cx="50" cy="50" r="40" fill="#ffc857" />
              <path
                d="M32 52 L45 65 L69 37"
                fill="none"
                stroke="#1a0b2e"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>
        <div className="lg-swap lg-in" style={vars({ "--s": ".2s" })}>
          <p className="lg-mid lg-sw-a">Verificamos tus datos</p>
          <p className="lg-mid lg-sw-b">¡Todo en orden!</p>
        </div>
      </section>

      {/* Escena 4: llegar al panel */}
      <section className="lg-scene" style={vars({ "--d": "12s" })}>
        <p className="lg-mid lg-in">Entras directo a tu panel</p>
        {/* <div className="lg-row">
          <div className="lg-role lg-in" style={vars({ "--s": ".2s" })}>
            <b>Cliente</b>
            <span>Tus espacios y solicitudes</span>
          </div>
          <div className="lg-role lg-in" style={vars({ "--s": ".45s" })}>
            <b>Administrador</b>
            <span>Usuarios, espacios, solicitudes y reportes</span>
          </div>
        </div> */}
        <p className="lg-sub lg-in" style={vars({ "--s": ".8s" })}>
          Tu sesión se mantiene activa 24 horas.
        </p>
      </section>
    </div>
  );
}
