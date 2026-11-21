import type {
  RequestsReportBundle,
  RequestsReportSheet,
} from "../entities/requests-report.entity";

export interface RequestsReportExporter {
  /** Genera el archivo con las hojas indicadas y lo descarga */
  download(
    bundle: RequestsReportBundle,
    sheets: RequestsReportSheet[],
    fileName: string,
  ): Promise<void>;
}
