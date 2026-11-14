import type { AuthUser } from "./AuthUser";

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}