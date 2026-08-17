import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import { clerkErrorMessage } from "./clerk";

export function clerkRedirectUrl() {
  return AuthSession.makeRedirectUri({
    scheme: "frontend",
    path: "sso-callback",
  });
}

export function ssoFailureMessage(
  authSessionResult: WebBrowser.WebBrowserAuthSessionResult | null | undefined,
  createdSessionId: string | null | undefined
): string | null {
  if (createdSessionId) return null;

  const type =
    authSessionResult && "type" in authSessionResult
      ? authSessionResult.type
      : null;

  if (type === "cancel" || type === "dismiss") {
    return (
      "Google did not finish. In Clerk Dashboard add this Redirect URL: " +
      clerkRedirectUrl()
    );
  }

  if (type === "success") {
    return "Google returned, but Clerk did not create a session. Enable Google OAuth under Clerk → Configure → SSO connections.";
  }

  return "Google sign-in did not complete. Enable Google in Clerk and whitelist the Expo redirect URL.";
}

export async function runGoogleSso(
  startSSOFlow: (params: {
    strategy: "oauth_google";
    redirectUrl?: string;
  }) => Promise<{
    createdSessionId: string | null;
    authSessionResult?: WebBrowser.WebBrowserAuthSessionResult | null;
  }>,
  startHostedAuth?: (params: {
    mode: "sign-in" | "sign-up";
  }) => Promise<{ createdSessionId: string | null }>
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    if (Platform.OS !== "web") {
      await WebBrowser.warmUpAsync().catch(() => {});
    }

    const redirectUrl = clerkRedirectUrl();
    const result = await startSSOFlow({
      strategy: "oauth_google",
      redirectUrl,
    });

    if (result.createdSessionId) {
      return { ok: true };
    }

    // Expo web / Expo Go often cannot complete native SSO; Account Portal works.
    if (startHostedAuth && (Platform.OS === "web" || !result.authSessionResult)) {
      const hosted = await startHostedAuth({ mode: "sign-in" });
      if (hosted.createdSessionId) return { ok: true };
    }

    if (
      startHostedAuth &&
      result.authSessionResult &&
      "type" in result.authSessionResult &&
      (result.authSessionResult.type === "cancel" ||
        result.authSessionResult.type === "dismiss")
    ) {
      const hosted = await startHostedAuth({ mode: "sign-in" });
      if (hosted.createdSessionId) return { ok: true };
    }

    return {
      ok: false,
      message: ssoFailureMessage(
        result.authSessionResult ?? null,
        result.createdSessionId
      ) ?? "Google sign-in did not complete.",
    };
  } catch (err) {
    return { ok: false, message: clerkErrorMessage(err) };
  } finally {
    if (Platform.OS !== "web") {
      await WebBrowser.coolDownAsync().catch(() => {});
    }
  }
}
