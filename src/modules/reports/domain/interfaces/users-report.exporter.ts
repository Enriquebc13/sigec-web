import type {
  UsersReportBundle,
  UsersReportSheet,
} from "../entities/users-report.entity";

export interface UsersReportExporter {
  /** Genera el archivo con las hojas indicadas y lo descarga */
  download(
    bundle: UsersReportBundle,
    sheets: UsersReportSheet[],
    fileName: string,
  ): Promise<void>;
}