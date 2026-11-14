import type { ReactNode } from "react";
import "./GradientScreen.css";

type Props = {
  children: ReactNode;
  wide?: boolean;
  /** Clase extra para el contenedor (por ejemplo, para ensancharlo en una pantalla) */
  className?: string;
};

export function GradientScreen({ children, wide = false, className }: Props) {
  const contentClass = [
    "gradient-screen__content",
    wide && "gradient-screen__content--wide",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="gradient-screen">
      <div className={contentClass}>{children}</div>
    </main>
  );
}