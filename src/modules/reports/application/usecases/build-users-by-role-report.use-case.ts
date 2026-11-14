import type { User, UserRole } from "../../../users/domain/entities/user.entity";
import type {
  DateRange,
  RoleSummaryRow,
} from "../../domain/entities/users-report.entity";
import { isInRange } from "../date-range";

const ROLES: UserRole[] = ["ADMIN", "CLIENT"];

export class BuildUsersByRoleReportUseCase {
  execute(users: User[], range: DateRange): RoleSummaryRow[] {
    const inRange = users.filter((u) => isInRange(u.createdAt, range));
    const total = inRange.length;

    return ROLES.map((role) => {
      const group = inRange.filter((u) => u.role === role);
      const active = group.filter((u) => u.active).length;

      return {
        role,
        total: group.length,
        active,
        inactive: group.length - active,
        percentage: total === 0 ? 0 : (group.length / total) * 100,
      };
    });
  }
}