import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import type { LoginRequest } from "../types";
import { useAuth } from "./use-auth";

export function useLogin() {
  const { startSession } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: startSession,
  });
}
