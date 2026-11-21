import type { Workbook } from "exceljs";
import {
  STATUS_PLURAL_LABELS,
  TYPE_LABELS,
  type PropertiesReportBundle,
  type PropertiesReportSheet,
} from "../../domain/entities/properties-report.entity";
import type { PropertiesReportExporter } from "../../domain/interfaces/properties-report.exporter";
import { loadExcelJS, saveFile, styleHeader } from "./excel-helpers";

function addInventorySheet(workbook: Workbook, bundle: PropertiesReportBundle) {
  const sheet = workbook.addWorksheet("Inventario por estado");
  sheet.columns = [
    { header: "Estado", key: "status", width: 18 },
    { header: "Propiedades", key: "count", width: 14 },
    { header: "Porcentaje", key: "percentage", width: 14 },
  ];

  for (const row of bundle.inventory) {
    sheet.addRow({
      status: STATUS_PLURAL_LABELS[row.status],
      count: row.count,
      percentage: row.percentage / 100,
    });
  }
  const total = bundle.inventory.reduce((sum, r) => sum + r.count, 0);
  sheet.addRow({ status: "Total", count: total, percentage: total ? 1 : 0 }).font = {
    bold: true,
  };

  sheet.getColumn("percentage").numFmt = "0.0%";
  styleHeader(sheet.getRow(1));
}

function addRentedSheet(workbook: Workbook, bundle: PropertiesReportBundle) {
  const sheet = workbook.addWorksheet("Propiedades rentadas", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = [
    { header: "Propiedad", key: "title", width: 34 },
    { header: "Tipo", key: "type", width: 12 },
    { header: "Ciudad", key: "city", width: 18 },
    { header: "Precio", key: "price", width: 14 },
    { header: "Rentada por", key: "renter", width: 30 },
    { header: "Correo", key: "email", width: 32 },
    { header: "Teléfono", key: "telefono", width: 16 },
    { header: "Solicitó el", key: "requestedAt", width: 14 },
  ];

  for (const row of bundle.rented) {
    sheet.addRow({
      title: row.title,
      type: TYPE_LABELS[row.type],
      city: row.city,
      price: row.price,
      renter: row.renter?.name ?? "Sin solicitante registrado",
      email: row.renter?.email ?? "",
      telefono: row.renter?.telefono ?? "",
      requestedAt: row.renter?.requestedAt ?? "",
    });
  }

  sheet.getColumn("price").numFmt = '"$"#,##0.00';
  sheet.getColumn("requestedAt").numFmt = "dd/mm/yyyy";
  styleHeader(sheet.getRow(1));
  sheet.autoFilter = { from: "A1", to: "H1" };
}

function addInfoSheet(workbook: Workbook) {
  const sheet = workbook.addWorksheet("Información");
  sheet.columns = [
    { key: "label", width: 24 },
    { key: "value", width: 46 },
  ];
  sheet.addRow({ label: "Reporte", value: "Propiedades · SIGEC" });
  sheet.addRow({ label: "Generado el", value: new Date().toLocaleString("es-MX") });
  sheet.addRow({
    label: "Nota",
    value: "Situación actual de las propiedades, sin filtro de fechas.",
  });
  sheet.getColumn("label").font = { bold: true };
}

export class PropertiesReportExcelExporter implements PropertiesReportExporter {
  async download(
    bundle: PropertiesReportBundle,
    sheets: PropertiesReportSheet[],
    fileName: string,
  ): Promise<void> {
    const { Workbook } = await loadExcelJS();
    const workbook = new Workbook();
    workbook.creator = "SIGEC";
    workbook.created = new Date();

    if (sheets.includes("inventory")) addInventorySheet(workbook, bundle);
    if (sheets.includes("rented")) addRentedSheet(workbook, bundle);
    addInfoSheet(workbook);

    const buffer = await workbook.xlsx.writeBuffer();
    saveFile(buffer as ArrayBuffer, fileName);
  }
}