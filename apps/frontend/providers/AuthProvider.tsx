import React, { useEffect, useState } from "react";

import { isClerkConfigured } from "../lib/clerk";
import { AuthContext, disabledAuth } from "./authContext";

export type { AppAuth, AppUser } from "./authContext";
export { useAppAuth } from "./authContext";

type Tree = React.ComponentType<{ children: React.ReactNode }>;

/**
 * Root auth wrapper. Must not import `@clerk/expo` — that package can bind this
 * file to a second React copy on web, which makes useState/useContext throw
 * "Cannot read properties of null".
 */
export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const [ClerkTree, setClerkTree] = useState<Tree | null>(null);

  useEffect(() => {
    if (!isClerkConfigured) return;

    let cancelled = false;
    import("./ClerkTree")
      .then((mod) => {
        if (!cancelled) setClerkTree(() => mod.ClerkTree);
      })
      .catch((err) => {
        console.warn("[auth] failed to load Clerk", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ClerkTree) {
    return (
      <AuthContext.Provider value={disabledAuth}>{children}</AuthContext.Provider>
    );
  }

  return <ClerkTree>{children}</ClerkTree>;
}
