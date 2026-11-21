import { useMemo, useState } from "react";
import { useProperties } from "../../../../properties/presentation/admin/hooks/use-properties";
import { useAdminRequests } from "../../../../requests/presentation/admin/hooks/use-admin-requests";
import { parseRange } from "../../../application/date-range";
import { BuildDemandByPropertyUseCase } from "../../../application/usecases/build-demand-by-property.use-case";
import { BuildRequestsByMonthUseCase } from "../../../application/usecases/build-requests-by-month.use-case";
import { BuildRequestsByStatusUseCase } from "../../../application/usecases/build-requests-by-status.use-case";
import { BuildWaitlistsReportUseCase } from "../../../application/usecases/build-waitlists-report.use-case";
import { ExportRequestsReportUseCase } from "../../../application/usecases/export-requests-report.use-case";
import {
  ALL_REQUEST_SHEETS,
  type RequestsReportSheet,
} from "../../../domain/entities/requests-report.entity";
import { RequestsReportExcelExporter } from "../../../infrastructure/exporters/requests-report-excel.exporter";

const buildByStatus = new BuildRequestsByStatusUseCase();
const buildByMonth = new BuildRequestsByMonthUseCase();
const buildDemand = new BuildDemandByPropertyUseCase();
const buildWaitlists = new BuildWaitlistsReportUseCase();
const exportReport = new ExportRequestsReportUseCase(
  new RequestsReportExcelExporter(),
);

// "2026-11-01" → "01/11/2026" (sin pasar por Date, para evitar desfases de zona horaria)
const formatInputDate = (value: string) => value.split("-").reverse().join("/");

function describeRange(from: string, to: string): string {
  if (!from && !to) return "Todas las fechas";
  if (from && to) return `${formatInputDate(from)} – ${formatInputDate(to)}`;
  return from
    ? `Desde ${formatInputDate(from)}`
    : `Hasta ${formatInputDate(to)}`;
}

export function useRequestsReports() {
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    reload: reloadRequests,
  } = useAdminRequests();
  const {
    properties,
    loading: propertiesLoading,
    error: propertiesError,
    reload: reloadProperties,
  } = useProperties();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  // Filtro propio del reporte de listas de espera ("" = todas las propiedades)
  const [waitlistPropertyId, setWaitlistPropertyId] = useState("");

  const [exporting, setExporting] = useState<RequestsReportSheet | "all" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const rangeError =
    from && to && from > to
      ? "La fecha inicial no puede ser mayor que la final"
      : null;

  // Con un rango inválido no se filtra por fecha (y se bloquean las descargas)
  const range = useMemo(
    () => (rangeError ? {} : parseRange(from, to)),
    [from, to, rangeError],
  );

  const byStatus = useMemo(
    () => buildByStatus.execute(requests, range),
    [requests, range],
  );
  const byMonth = useMemo(
    () => buildByMonth.execute(requests, range),
    [requests, range],
  );
  const demand = useMemo(
    () => buildDemand.execute(requests, properties, range),
    [requests, properties, range],
  );
  const waitlists = useMemo(
    () => buildWaitlists.execute(requests, properties, waitlistPropertyId || undefined),
    [requests, properties, waitlistPropertyId],
  );

  const clearDates = () => {
    setFrom("");
    setTo("");
  };

  const reload = () => {
    reloadRequests();
    reloadProperties();
  };

  const download = async (sheets: RequestsReportSheet[]) => {
    setExportError(null);
    setExporting(sheets.length === ALL_REQUEST_SHEETS.length ? "all" : sheets[0]);
    try {
      await exportReport.execute(
        { byStatus, byMonth, demand, waitlists, rangeLabel: describeRange(from, to) },
        sheets,
      );
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "No se pudo generar el archivo",
      );
    } finally {
      setExporting(null);
    }
  };

  return {
    // datos
    loading: requestsLoading || propertiesLoading,
    error: requestsError ?? propertiesError,
    reload,
    properties,
    byStatus,
    byMonth,
    demand,
    waitlists,
    // filtros
    from,
    to,
    setFrom,
    setTo,
    clearDates,
    rangeError,
    waitlistPropertyId,
    setWaitlistPropertyId,
    // exportación
    exporting,
    exportError,
    download,
  };
}
