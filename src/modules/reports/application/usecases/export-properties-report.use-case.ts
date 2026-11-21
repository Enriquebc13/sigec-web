import type {
  PropertiesReportBundle,
  PropertiesReportSheet,
} from "../../domain/entities/properties-report.entity";
import type { PropertiesReportExporter } from "../../domain/interfaces/properties-report.exporter";

const SHEET_NAMES: Record<PropertiesReportSheet, string> = {
  inventory: "inventario-por-estado",
  rented: "propiedades-rentadas",
};

const pad = (n: number) => String(n).padStart(2, "0");

export class ExportPropertiesReportUseCase {
  private readonly exporter: PropertiesReportExporter;

  constructor(exporter: PropertiesReportExporter) {
    this.exporter = exporter;
  }

  execute(
    bundle: PropertiesReportBundle,
    sheets: PropertiesReportSheet[],
  ): Promise<void> {
    if (sheets.length === 0) {
      throw new Error("Elige al menos un reporte para descargar");
    }

    const now = new Date();
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const what = sheets.length === 1 ? SHEET_NAMES[sheets[0]] : "completo";

    return this.exporter.download(
      bundle,
      sheets,
      `reporte-propiedades-${what}-${today}.xlsx`,
    );
  }
}