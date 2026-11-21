import type { Workbook } from "exceljs";
import {
  BUCKET_LABELS,
  PROPERTY_STATUS_LABELS,
  type RequestsReportBundle,
  type RequestsReportSheet,
} from "../../domain/entities/requests-report.entity";
import type { RequestsReportExporter } from "../../domain/interfaces/requests-report.exporter";
import { loadExcelJS, saveFile, styleHeader } from "./excel-helpers";

function addByStatusSheet(workbook: Workbook, bundle: RequestsReportBundle) {
  const sheet = workbook.addWorksheet("Solicitudes por estado");
  sheet.columns = [
    { header: "Estado", key: "status", width: 18 },
    { header: "Solicitudes", key: "count", width: 14 },
    { header: "Porcentaje", key: "percentage", width: 14 },
  ];

  for (const row of bundle.byStatus) {
    sheet.addRow({
      status: BUCKET_LABELS[row.bucket],
      count: row.count,
      percentage: row.percentage / 100,
    });
  }
  const total = bundle.byStatus.reduce((sum, r) => sum + r.count, 0);
  sheet.addRow({ status: "Total", count: total, percentage: total ? 1 : 0 }).font = {
    bold: true,
  };

  sheet.getColumn("percentage").numFmt = "0.0%";
  styleHeader(sheet.getRow(1));
}

function addByMonthSheet(workbook: Workbook, bundle: RequestsReportBundle) {
  const sheet = workbook.addWorksheet("Solicitudes por mes", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = [
    { header: "Mes", key: "label", width: 22 },
    { header: "Total", key: "total", width: 10 },
    { header: "Pendientes", key: "PENDING", width: 13 },
    { header: "Aprobadas", key: "APPROVED", width: 13 },
    { header: "Rechazadas", key: "REJECTED", width: 13 },
    { header: "Canceladas", key: "CANCELLED", width: 13 },
  ];

  for (const row of bundle.byMonth) sheet.addRow(row);
  styleHeader(sheet.getRow(1));
}

function addDemandSheet(workbook: Workbook, bundle: RequestsReportBundle) {
  const sheet = workbook.addWorksheet("Demanda por propiedad", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = [
    { header: "Propiedad", key: "title", width: 34 },
    { header: "Estado actual", key: "propertyStatus", width: 16 },
    { header: "Solicitudes", key: "total", width: 13 },
    { header: "En espera", key: "PENDING", width: 12 },
    { header: "Aprobadas", key: "APPROVED", width: 12 },
    { header: "Rechazadas", key: "REJECTED", width: 13 },
    { header: "Canceladas", key: "CANCELLED", width: 13 },
  ];

  for (const row of bundle.demand) {
    sheet.addRow({
      ...row,
      propertyStatus: PROPERTY_STATUS_LABELS[row.propertyStatus],
    });
  }
  styleHeader(sheet.getRow(1));
  sheet.autoFilter = { from: "A1", to: "G1" };
}

function addWaitlistsSheet(workbook: Workbook, bundle: RequestsReportBundle) {
  const sheet = workbook.addWorksheet("Listas de espera", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = [
    { header: "Propiedad", key: "title", width: 34 },
    { header: "Estado propiedad", key: "propertyStatus", width: 17 },
    { header: "Puesto", key: "position", width: 9 },
    { header: "Nombre", key: "name", width: 30 },
    { header: "Correo", key: "email", width: 32 },
    { header: "Teléfono", key: "telefono", width: 16 },
    { header: "Solicitó el", key: "createdAt", width: 14 },
  ];

  for (const group of bundle.waitlists) {
    const propertyStatus = PROPERTY_STATUS_LABELS[group.propertyStatus];
    // Quien tiene el trato en curso no está en la fila: va en su propia fila
    if (group.inProgress) {
      sheet.addRow({
        title: group.title,
        propertyStatus,
        position: "Trato en curso",
        name: group.inProgress,
      });
    }
    for (const entry of group.entries) {
      sheet.addRow({ title: group.title, propertyStatus, ...entry });
    }
  }

  sheet.getColumn("createdAt").numFmt = "dd/mm/yyyy";
  styleHeader(sheet.getRow(1));
  sheet.autoFilter = { from: "A1", to: "G1" };
}

function addInfoSheet(workbook: Workbook, bundle: RequestsReportBundle) {
  const sheet = workbook.addWorksheet("Información");
  sheet.columns = [
    { key: "label", width: 30 },
    { key: "value", width: 46 },
  ];

  sheet.addRow({ label: "Reporte", value: "Solicitudes · SIGEC" });
  sheet.addRow({ label: "Generado el", value: new Date().toLocaleString("es-MX") });
  sheet.addRow({
    label: "Rango (fecha de solicitud)",
    value: bundle.rangeLabel,
  });
  sheet.addRow({
    label: "Nota",
    value: "Las listas de espera son la situación actual y no dependen del rango.",
  });
  sheet.getColumn("label").font = { bold: true };
}

export class RequestsReportExcelExporter implements RequestsReportExporter {
  async download(
    bundle: RequestsReportBundle,
    sheets: RequestsReportSheet[],
    fileName: string,
  ): Promise<void> {
    const { Workbook } = await loadExcelJS();
    const workbook = new Workbook();
    workbook.creator = "SIGEC";
    workbook.created = new Date();

    if (sheets.includes("byStatus")) addByStatusSheet(workbook, bundle);
    if (sheets.includes("byMonth")) addByMonthSheet(workbook, bundle);
    if (sheets.includes("demand")) addDemandSheet(workbook, bundle);
    if (sheets.includes("waitlists")) addWaitlistsSheet(workbook, bundle);
    addInfoSheet(workbook, bundle);

    const buffer = await workbook.xlsx.writeBuffer();
    saveFile(buffer as ArrayBuffer, fileName);
  }
}
