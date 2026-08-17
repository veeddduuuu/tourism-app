import React, { useEffect, useMemo } from "react";
import { ClerkProvider, useAuth, useClerk, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

import { CLERK_PUBLISHABLE_KEY } from "../lib/clerk";
import { setAuthTokenGetter } from "../services/http";
import {
  AuthContext,
  type AppAuth,
  type AppUser,
} from "./authContext";

function ClerkBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        return (await getToken()) ?? null;
      } catch {
        return null;
      }
    });
    return () => setAuthTokenGetter(null);
  }, [getToken, isSignedIn]);

  const value = useMemo<AppAuth>(() => {
    const appUser: AppUser | null = user
      ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.primaryEmailAddress?.emailAddress ?? null,
          imageUrl: user.imageUrl ?? null,
        }
      : null;

    return {
      enabled: true,
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      userId: userId ?? null,
      user: appUser,
      signOut: async () => {
        await signOut();
      },
    };
  }, [isLoaded, isSignedIn, userId, user, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Isolated so `@clerk/expo` never shares a module with root-layout hooks. */
export function ClerkTree({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  );
}
