import type { ReactNode } from "react";
import "./GlowScreen.css";

type Props = {
  children: ReactNode;
  wide?: boolean;
  /** Clase extra para el contenedor (por ejemplo, para ensancharlo en una pantalla) */
  className?: string;
};

/**
 * Misma estructura y props que GradientScreen, pero con el fondo oscuro
 * con arco luminoso del home del cliente.
 */
export function GlowScreen({ children, wide = false, className }: Props) {
  const contentClass = [
    "glow-screen__content",
    wide && "glow-screen__content--wide",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="glow-screen">
      <div className={contentClass}>{children}</div>
    </main>
  );
}
