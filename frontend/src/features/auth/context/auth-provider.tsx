"use client";

import { createContext, useCallback, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { sessionCookie } from "@/lib/auth/session-cookie";
import { authApi } from "../api/auth.api";
import type { LoginResponse, UserProfile } from "../types";

export const currentUserQueryKey = ["auth", "me"] as const;

interface AuthContextValue {
  user: UserProfile | undefined;
  isLoading: boolean;
  isError: boolean;
  isAdmin: boolean;
  retry: () => void;
  startSession: (session: LoginResponse) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: authApi.me,
    enabled: () => Boolean(sessionCookie.get()),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const startSession = useCallback(
    (session: LoginResponse) => {
      sessionCookie.set(session.accessToken, session.expiresAt);
      queryClient.setQueryData(currentUserQueryKey, session.user);
    },
    [queryClient],
  );

  const signOut = useCallback(() => {
    sessionCookie.clear();
    queryClient.clear();
    router.replace(routes.login);
  }, [queryClient, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isError,
      isAdmin: user?.role === "Admin",
      retry: () => void refetch(),
      startSession,
      signOut,
    }),
    [user, isLoading, isError, refetch, startSession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
