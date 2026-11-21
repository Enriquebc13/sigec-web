import { useMemo, useState } from "react";
import { useProperties } from "../../../../properties/presentation/admin/hooks/use-properties";
import { useAdminRequests } from "../../../../requests/presentation/admin/hooks/use-admin-requests";
import { BuildInventoryByStatusUseCase } from "../../../application/usecases/build-inventory-by-status.use-case";
import { BuildRentedPropertiesUseCase } from "../../../application/usecases/build-rented-properties.use-case";
import { ExportPropertiesReportUseCase } from "../../../application/usecases/export-properties-report.use-case";
import {
  ALL_PROPERTY_SHEETS,
  type PropertiesReportSheet,
} from "../../../domain/entities/properties-report.entity";
import { PropertiesReportExcelExporter } from "../../../infrastructure/exporters/properties-report-excel.exporter";

const buildInventory = new BuildInventoryByStatusUseCase();
const buildRented = new BuildRentedPropertiesUseCase();
const exportReport = new ExportPropertiesReportUseCase(
  new PropertiesReportExcelExporter(),
);

export function usePropertiesReports() {
  const {
    properties,
    loading: propertiesLoading,
    error: propertiesError,
    reload: reloadProperties,
  } = useProperties();
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    reload: reloadRequests,
  } = useAdminRequests();

  const [exporting, setExporting] = useState<PropertiesReportSheet | "all" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const inventory = useMemo(() => buildInventory.execute(properties), [properties]);
  const rented = useMemo(
    () => buildRented.execute(properties, requests),
    [properties, requests],
  );

  const reload = () => {
    reloadProperties();
    reloadRequests();
  };

  const download = async (sheets: PropertiesReportSheet[]) => {
    setExportError(null);
    setExporting(sheets.length === ALL_PROPERTY_SHEETS.length ? "all" : sheets[0]);
    try {
      await exportReport.execute({ inventory, rented }, sheets);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "No se pudo generar el archivo",
      );
    } finally {
      setExporting(null);
    }
  };

  return {
    loading: propertiesLoading || requestsLoading,
    error: propertiesError ?? requestsError,
    reload,
    total: properties.length,
    inventory,
    rented,
    exporting,
    exportError,
    download,
  };
}