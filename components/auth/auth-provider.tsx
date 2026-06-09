"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { isSuperAdminEmail } from "@/lib/admin";
import {
  signInAdmin,
  signOutAdmin,
  subscribeToAuthState,
} from "@/lib/firebase/auth";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return subscribeToAuthState((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInAdmin(email, password);
    if (!isSuperAdminEmail(email)) {
      await signOutAdmin();
      throw new Error("Ce compte n'est pas autorisé.");
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutAdmin();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isSuperAdmin: isSuperAdminEmail(user?.email),
      signIn,
      signOut,
    }),
    [user, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
