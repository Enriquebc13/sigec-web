import type { Row } from "exceljs";

type ExcelModule = typeof import("exceljs");

// exceljs se descarga solo cuando alguien pide un reporte
export async function loadExcelJS(): Promise<ExcelModule> {
  const mod = (await import("exceljs")) as ExcelModule & {
    default?: ExcelModule;
  };
  return mod.default ?? mod;
}

const HEADER_FILL = "FF8559F0"; // morado de SIGEC

export function styleHeader(row: Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: HEADER_FILL },
  };
  row.alignment = { vertical: "middle" };
  row.height = 22;
}

export function saveFile(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
