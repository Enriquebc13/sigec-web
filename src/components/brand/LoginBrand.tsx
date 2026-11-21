import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import "./LoginBrand.css";

type Props = {
  size?: number;        // ancho del logo en px
  showText?: boolean;   // SIGEC + lema debajo del logo
  playOnView?: boolean; // true: la animación empieza cuando el logo entra en pantalla (ideal en la landing)
};

export default function LoginBrand({ size = 220, showText = true, playOnView = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(!playOnView);

  useEffect(() => {
    if (!playOnView) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [playOnView]);

  return (
    <div
      ref={ref}
      className="login-brand"
      data-active={active}
      style={{ "--lb-size": `${size}px` } as CSSProperties}
    >
      <div className="lb-float">
        <svg className="lb-logo" viewBox="0 0 680 680" role="img" aria-label="Logo SIGEC">
          <defs>
            {/* id fijo: si pones dos LoginBrand en la misma pantalla, comparten la máscara (no hay problema) */}
            <mask id="sigec-notch">
              <rect width="680" height="680" fill="#fff" />
              <circle cx="448" cy="220" r="64" fill="#000" />
            </mask>
          </defs>

          {/* Fondo blanco: conserva los colores del logo sobre el degradado morado */}
          <rect className="lb-bg" x="10" y="10" width="660" height="660" rx="115" fill="#fff" />
          <rect className="lb-frame" x="10.5" y="10.5" width="659" height="659" rx="115"
            fill="none" stroke="#213A63" strokeWidth="21" pathLength={1} />

          <rect className="lb-floor" x="118" y="580" width="504" height="18" rx="9" fill="#213A63" />

          <g className="lb-b lb-b1">
            <rect x="130" y="340" width="126" height="240" rx="12" fill="#213A63" />
            <rect x="154" y="370" width="30" height="30" fill="#DEE0EA" />
            <rect x="208" y="370" width="30" height="30" fill="#DEE0EA" />
            <rect x="172" y="424" width="42" height="83" rx="6" fill="#fff" />
          </g>

          <g className="lb-b lb-b2">
            <g mask="url(#sigec-notch)">
              <rect x="292" y="244" width="156" height="336" rx="12" fill="#1FA096" />
              <rect x="316" y="286" width="36" height="36" fill="#E6F4F3" />
              <rect x="376" y="286" width="36" height="36" fill="#E6F4F3" />
              <rect x="316" y="346" width="36" height="36" fill="#E6F4F3" />
              <rect x="376" y="346" width="36" height="36" fill="#E6F4F3" />
              <rect x="343" y="424" width="54" height="156" fill="#fff" />
            </g>
          </g>

          <g className="lb-b lb-b3">
            <rect x="484" y="376" width="126" height="204" rx="12" fill="#213A63" />
            <rect x="508" y="406" width="30" height="30" fill="#DEE0EA" />
            <rect x="562" y="406" width="30" height="30" fill="#DEE0EA" />
            <rect x="526" y="448" width="42" height="72" rx="6" fill="#fff" />
          </g>

          <circle className="lb-dot" cx="448" cy="220" r="54" fill="#1FA096" />
          <path className="lb-tick" d="M415 225 L438 245 L481 192" fill="none" stroke="#fff"
            strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
        </svg>
      </div>

      {showText && (
        <>
          <p className="lb-name">SIGEC</p>
          <p className="lb-motto">Orden que genera valor</p>
          <p className="lb-desc">Sistema Integral de Gestión de Espacios Comerciales</p>
        </>
      )}
    </div>
  );
}