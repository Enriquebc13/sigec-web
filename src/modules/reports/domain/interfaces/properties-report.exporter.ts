import type {
  PropertiesReportBundle,
  PropertiesReportSheet,
} from "../entities/properties-report.entity";

export interface PropertiesReportExporter {
  /** Genera el archivo con las hojas indicadas y lo descarga */
  download(
    bundle: PropertiesReportBundle,
    sheets: PropertiesReportSheet[],
    fileName: string,
  ): Promise<void>;
}