import type { User, UserRole } from "../../../users/domain/entities/user.entity";
import type {
  DateRange,
  UserReportRow,
} from "../../domain/entities/users-report.entity";
import { isInRange } from "../date-range";

export interface UsersListFilters {
  range: DateRange;
  role?: UserRole;
  active?: boolean;
}

export class BuildUsersListReportUseCase {
  execute(users: User[], { range, role, active }: UsersListFilters): UserReportRow[] {
    return users
      .filter(
        (u) =>
          isInRange(u.createdAt, range) &&
          (role === undefined || u.role === role) &&
          (active === undefined || u.active === active),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((u) => ({
        name: `${u.name} ${u.lastname}`,
        email: u.email,
        role: u.role,
        active: u.active,
        createdAt: u.createdAt,
      }));
  }
}