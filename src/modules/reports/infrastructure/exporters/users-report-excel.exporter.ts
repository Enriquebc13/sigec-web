import type { Row, Workbook } from "exceljs";
import {
  ROLE_LABELS,
  statusLabel,
  type UsersReportBundle,
  type UsersReportSheet,
} from "../../domain/entities/users-report.entity";
import type { UsersReportExporter } from "../../domain/interfaces/users-report.exporter";

type ExcelModule = typeof import("exceljs");

// exceljs se descarga solo cuando alguien pide un reporte
async function loadExcelJS(): Promise<ExcelModule> {
  const mod = (await import("exceljs")) as ExcelModule & {
    default?: ExcelModule;
  };
  return mod.default ?? mod;
}

const HEADER_FILL = "FF8559F0"; // morado de SIGEC

function styleHeader(row: Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: HEADER_FILL },
  };
  row.alignment = { vertical: "middle" };
  row.height = 22;
}

function addListSheet(workbook: Workbook, bundle: UsersReportBundle) {
  const sheet = workbook.addWorksheet("Listado de usuarios", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Nombre", key: "name", width: 32 },
    { header: "Correo", key: "email", width: 34 },
    { header: "Rol", key: "role", width: 16 },
    { header: "Estado", key: "status", width: 12 },
    { header: "Registro", key: "createdAt", width: 14 },
  ];

  for (const row of bundle.list) {
    sheet.addRow({
      name: row.name,
      email: row.email,
      role: ROLE_LABELS[row.role],
      status: statusLabel(row.active),
      createdAt: row.createdAt,
    });
  }

  sheet.getColumn("createdAt").numFmt = "dd/mm/yyyy";
  styleHeader(sheet.getRow(1));
  sheet.autoFilter = { from: "A1", to: "E1" };
}

function addByRoleSheet(workbook: Workbook, bundle: UsersReportBundle) {
  const sheet = workbook.addWorksheet("Usuarios por rol");

  sheet.columns = [
    { header: "Rol", key: "role", width: 18 },
    { header: "Total", key: "total", width: 12 },
    { header: "Activos", key: "active", width: 12 },
    { header: "Inactivos", key: "inactive", width: 12 },
    { header: "Porcentaje", key: "percentage", width: 14 },
  ];

  for (const row of bundle.byRole) {
    sheet.addRow({
      role: ROLE_LABELS[row.role],
      total: row.total,
      active: row.active,
      inactive: row.inactive,
      percentage: row.percentage / 100,
    });
  }

  const total = bundle.byRole.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      active: acc.active + r.active,
      inactive: acc.inactive + r.inactive,
    }),
    { total: 0, active: 0, inactive: 0 },
  );
  const totalRow = sheet.addRow({ role: "Total", ...total, percentage: 1 });
  totalRow.font = { bold: true };

  sheet.getColumn("percentage").numFmt = "0.0%";
  styleHeader(sheet.getRow(1));
}

function addByMonthSheet(workbook: Workbook, bundle: UsersReportBundle) {
  const sheet = workbook.addWorksheet("Registros por mes", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Mes", key: "label", width: 22 },
    { header: "Registros", key: "count", width: 14 },
    { header: "Acumulado", key: "cumulative", width: 14 },
  ];

  for (const row of bundle.byMonth) {
    sheet.addRow({
      label: row.label,
      count: row.count,
      cumulative: row.cumulative,
    });
  }

  styleHeader(sheet.getRow(1));
}

function addInfoSheet(workbook: Workbook, bundle: UsersReportBundle) {
  const sheet = workbook.addWorksheet("Información");
  sheet.columns = [
    { key: "label", width: 28 },
    { key: "value", width: 40 },
  ];

  sheet.addRow({ label: "Reporte", value: "Usuarios · SIGEC" });
  sheet.addRow({
    label: "Generado el",
    value: new Date().toLocaleString("es-MX"),
  });
  sheet.addRow({
    label: "Rango (fecha de registro)",
    value: bundle.rangeLabel,
  });
  sheet.getColumn("label").font = { bold: true };
}

function saveFile(buffer: ArrayBuffer, fileName: string) {
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

export class UsersReportExcelExporter implements UsersReportExporter {
  async download(
    bundle: UsersReportBundle,
    sheets: UsersReportSheet[],
    fileName: string,
  ): Promise<void> {
    const { Workbook } = await loadExcelJS();
    const workbook = new Workbook();
    workbook.creator = "SIGEC";
    workbook.created = new Date();

    if (sheets.includes("list")) addListSheet(workbook, bundle);
    if (sheets.includes("byRole")) addByRoleSheet(workbook, bundle);
    if (sheets.includes("byMonth")) addByMonthSheet(workbook, bundle);
    addInfoSheet(workbook, bundle);

    const buffer = await workbook.xlsx.writeBuffer();
    saveFile(buffer as ArrayBuffer, fileName);
  }
}