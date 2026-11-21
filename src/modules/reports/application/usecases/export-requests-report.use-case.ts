import {
  type RequestsReportBundle,
  type RequestsReportSheet,
} from "../../domain/entities/requests-report.entity";
import type { RequestsReportExporter } from "../../domain/interfaces/requests-report.exporter";

const SHEET_NAMES: Record<RequestsReportSheet, string> = {
  byStatus: "por-estado",
  byMonth: "por-mes",
  demand: "demanda-por-propiedad",
  waitlists: "listas-de-espera",
};

const pad = (n: number) => String(n).padStart(2, "0");

export class ExportRequestsReportUseCase {
  private readonly exporter: RequestsReportExporter;

  constructor(exporter: RequestsReportExporter) {
    this.exporter = exporter;
  }

  execute(bundle: RequestsReportBundle, sheets: RequestsReportSheet[]): Promise<void> {
    if (sheets.length === 0) {
      throw new Error("Elige al menos un reporte para descargar");
    }

    const now = new Date();
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const what = sheets.length === 1 ? SHEET_NAMES[sheets[0]] : "completo";

    return this.exporter.download(
      bundle,
      sheets,
      `reporte-solicitudes-${what}-${today}.xlsx`,
    );
  }
}
