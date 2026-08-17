import { apiGet, apiPost } from "../http";
import type { AuthUser, AuthSession } from "../contracts";

/** GET /auth/me — Clerk user as seen by the backend (proves the JWT). */
export function getMe(signal?: AbortSignal): Promise<AuthUser> {
  return apiGet<AuthUser>("/auth/me", undefined, { signal });
}

/** GET /auth/session — whether the current Bearer token is valid. */
export function getAuthSession(signal?: AbortSignal): Promise<AuthSession> {
  return apiGet<AuthSession>("/auth/session", undefined, { signal });
}

/** POST /auth/register — backend-created Clerk user (email already verified). */
export function registerAccount(
  email: string,
  password: string
): Promise<{ created: boolean; existing?: boolean }> {
  return apiPost("/auth/register", { email, password });
}
