import { useMemo, useState } from "react";
import type { UserRole } from "../../../../users/domain/entities/user.entity";
import { useUsers } from "../../../../users/presentation/admin/hooks/use-users";
import { parseRange } from "../../../application/date-range";
import { BuildRegistrationsByMonthUseCase } from "../../../application/usecases/build-registrations-by-month.use-case";
import { BuildUsersByRoleReportUseCase } from "../../../application/usecases/build-users-by-role-report.use-case";
import { BuildUsersListReportUseCase } from "../../../application/usecases/build-users-list-report.use-case";
import { ExportUsersReportUseCase } from "../../../application/usecases/export-users-report.use-case";
import type { UsersReportSheet } from "../../../domain/entities/users-report.entity";
import { UsersReportExcelExporter } from "../../../infrastructure/exporters/users-report-excel.exporter";

const buildList = new BuildUsersListReportUseCase();
const buildByRole = new BuildUsersByRoleReportUseCase();
const buildByMonth = new BuildRegistrationsByMonthUseCase();
const exportReport = new ExportUsersReportUseCase(new UsersReportExcelExporter());

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

// "2026-11-01" → "01/11/2026" (sin pasar por Date, para evitar desfases de zona horaria)
const formatInputDate = (value: string) => value.split("-").reverse().join("/");

function describeRange(from: string, to: string): string {
  if (!from && !to) return "Todas las fechas";
  if (from && to) return `${formatInputDate(from)} – ${formatInputDate(to)}`;
  return from
    ? `Desde ${formatInputDate(from)}`
    : `Hasta ${formatInputDate(to)}`;
}

export function useUsersReports() {
  const { users, loading, error, reload } = useUsers();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [role, setRole] = useState<UserRole | "ALL">("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const [exporting, setExporting] = useState<UsersReportSheet | "all" | null>(null);
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

  const list = useMemo(
    () =>
      buildList.execute(users, {
        range,
        role: role === "ALL" ? undefined : role,
        active: status === "ALL" ? undefined : status === "ACTIVE",
      }),
    [users, range, role, status],
  );
  const byRole = useMemo(() => buildByRole.execute(users, range), [users, range]);
  const byMonth = useMemo(() => buildByMonth.execute(users, range), [users, range]);

  const clearDates = () => {
    setFrom("");
    setTo("");
  };

  const download = async (sheets: UsersReportSheet[]) => {
    setExportError(null);
    setExporting(sheets.length === 3 ? "all" : sheets[0]);
    try {
      await exportReport.execute(
        { list, byRole, byMonth, rangeLabel: describeRange(from, to) },
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
    loading,
    error,
    reload,
    list,
    byRole,
    byMonth,
    // filtros
    from,
    to,
    role,
    status,
    setFrom,
    setTo,
    setRole,
    setStatus,
    clearDates,
    rangeError,
    // exportación
    exporting,
    exportError,
    download,
  };
}