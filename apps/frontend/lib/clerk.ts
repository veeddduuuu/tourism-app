import { router } from "expo-router";

export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const isClerkConfigured = CLERK_PUBLISHABLE_KEY.startsWith("pk_");

/** After welcome, send users through auth then into guide selection. */
export function continueAfterAuth(next?: string | string[]) {
  const dest = Array.isArray(next) ? next[0] : next;
  if (dest === "onboarding") {
    router.replace("/guide-selector" as any);
    return;
  }
  router.replace("/(tabs)" as any);
}

export function clerkErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const withErrors = err as {
      errors?: { longMessage?: string; message?: string; code?: string }[];
      longMessage?: string;
      message?: string;
      code?: string;
    };
    if (typeof withErrors.longMessage === "string" && withErrors.longMessage) {
      return withErrors.longMessage;
    }
    const first = withErrors.errors?.[0];
    if (first?.longMessage) return first.longMessage;
    if (first?.message) return first.message;
    if (typeof withErrors.message === "string" && withErrors.message) {
      return withErrors.message;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}
