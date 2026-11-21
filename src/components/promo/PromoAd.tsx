import type { CSSProperties } from "react";
import "./PromoAd.css";

type Props = { className?: string };

// Permite pasar variables CSS (--d, --s) en style sin errores de TypeScript
const vars = (o: Record<string, string>) => o as CSSProperties;

export default function PromoAd({ className = "" }: Props) {
  return (
    <div
      className={`promo ${className}`.trim()}
      role="img"
      aria-label="Anuncio animado de SIGEC: encuentra tu espacio, solicita con un toque y entra a la lista de espera"
    >
      <div className="promo-orb promo-o1" />
      <div className="promo-orb promo-o2" />
      <div className="promo-orb promo-o3" />

      {/* Escena 1 */}
      <section className="promo-scene" style={vars({ "--d": "0s" })}>
        <p className="promo-big promo-in" style={vars({ "--s": "0s" })}>¿Buscas un espacio</p>
        <p className="promo-big promo-in" style={vars({ "--s": ".25s" })}>para tu negocio?</p>
        <p className="promo-sub promo-in" style={vars({ "--s": ".6s" })}>Aquí ya hay uno disponible.</p>
      </section>

      {/* Escena 2 */}
      <section className="promo-scene" style={vars({ "--d": "4s" })}>
        <p className="promo-mid promo-in">Locales, oficinas y bodegas</p>
        <div className="promo-row">
          <div className="promo-tile promo-in" style={vars({ "--s": ".2s" })}>
            <svg viewBox="0 0 100 80" fill="none" stroke="#ffc857" strokeWidth="3" strokeLinejoin="round">
              <path d="M14 36h72v38H14z" />
              <path d="M8 36l8-18h68l8 18z" fill="#5E35B1" />
              <path d="M40 74V52h20v22" />
            </svg>
            Local
          </div>
          <div className="promo-tile promo-in" style={vars({ "--s": ".45s" })}>
            <svg viewBox="0 0 100 80" fill="none" stroke="#d9c8ff" strokeWidth="3" strokeLinejoin="round">
              <path d="M28 74V10h44v64z" />
              <path d="M38 22h8M54 22h8M38 36h8M54 36h8M38 50h8M54 50h8M44 74V62h12v12" />
            </svg>
            Oficina
          </div>
          <div className="promo-tile promo-in" style={vars({ "--s": ".7s" })}>
            <svg viewBox="0 0 100 80" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round">
              <path d="M10 74V30l40-18 40 18v44z" />
              <path d="M30 74V46h40v28M30 56h40M30 65h40" />
            </svg>
            Bodega
          </div>
        </div>
      </section>

      {/* Escena 3 */}
      <section className="promo-scene" style={vars({ "--d": "8s" })}>
        <p className="promo-mid promo-in">Solicítalo en un toque</p>
        <div className="promo-listing promo-in" style={vars({ "--s": ".2s" })}>
          <b>Local en el centro</b>
          <span>Puebla, Puebla</span>
          <div className="promo-btnwrap">
            <div className="promo-btn promo-btn-a">Me interesa</div>
            <div className="promo-btn promo-btn-b">Solicitud enviada</div>
          </div>
          <div className="promo-chip">Ya estás en la lista de espera</div>
        </div>
      </section>

      {/* Escena 4 */}
      <section className="promo-scene" style={vars({ "--d": "12s" })}>
        <p className="promo-brand promo-in" style={vars({ "--s": "0s" })}>SIGEC</p>
        <p className="promo-mid promo-in" style={vars({ "--s": ".3s", marginTop: "2cqw" })}>Orden que genera valor</p>
        <p className="promo-sub promo-in" style={vars({ "--s": ".6s" })}>Equipo MEGK</p>
      </section>
    </div>
  );
}
