import type {
  UsersReportBundle,
  UsersReportSheet,
} from "../../domain/entities/users-report.entity";
import type { UsersReportExporter } from "../../domain/interfaces/users-report.exporter";

const SHEET_NAMES: Record<UsersReportSheet, string> = {
  list: "listado",
  byRole: "por-rol",
  byMonth: "registros-por-mes",
};

const pad = (n: number) => String(n).padStart(2, "0");

export class ExportUsersReportUseCase {
  private readonly exporter: UsersReportExporter;

  constructor(exporter: UsersReportExporter) {
    this.exporter = exporter;
  }

  execute(bundle: UsersReportBundle, sheets: UsersReportSheet[]): Promise<void> {
    if (sheets.length === 0) {
      throw new Error("Elige al menos un reporte para descargar");
    }

    const now = new Date();
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const what = sheets.length === 3 ? "completo" : SHEET_NAMES[sheets[0]];

    return this.exporter.download(
      bundle,
      sheets,
      `reporte-usuarios-${what}-${today}.xlsx`,
    );
  }
}