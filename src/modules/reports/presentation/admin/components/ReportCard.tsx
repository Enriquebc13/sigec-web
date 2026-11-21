import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  busy: boolean;
  disabled: boolean;
  onDownload: () => void;
  children: ReactNode;
};

/** Tarjeta de un reporte: título, descripción, botón de Excel y contenido */
export function ReportCard({
  title,
  description,
  busy,
  disabled,
  onDownload,
  children,
}: Props) {
  return (
    <section className="reports__card">
      <div className="reports__card-head">
        <div>
          <h2 className="reports__card-title">{title}</h2>
          <p className="reports__card-text">{description}</p>
        </div>
        <button
          type="button"
          className="reports__download"
          onClick={onDownload}
          disabled={disabled || busy}
        >
          {busy ? "Generando..." : "⬇ Excel"}
        </button>
      </div>
      {children}
    </section>
  );
}
