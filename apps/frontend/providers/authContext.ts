import { createContext, useContext } from "react";

export type AppUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  imageUrl: string | null;
};

export type AppAuth = {
  enabled: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  user: AppUser | null;
  signOut: () => Promise<void>;
};

export const disabledAuth: AppAuth = {
  enabled: false,
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  user: null,
  signOut: async () => {},
};

export const AuthContext = createContext<AppAuth>(disabledAuth);

export function useAppAuth(): AppAuth {
  return useContext(AuthContext);
}
