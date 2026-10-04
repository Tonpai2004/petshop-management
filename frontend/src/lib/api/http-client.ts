import axios from "axios";
import { env } from "@/config/env";
import { routes } from "@/config/routes";
import { sessionCookie } from "@/lib/auth/session-cookie";
import { toApiError } from "./api-error";

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config) => {
  const token = sessionCookie.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    const isLoginCall = error.config?.url?.includes("/auth/login");

    // Token expired or got revoked while the user was on the page. Send them back to login.
    if (apiError.isUnauthorized && !isLoginCall && typeof window !== "undefined") {
      sessionCookie.clear();
      window.location.replace(`${routes.login}?expired=1`);
    }

    return Promise.reject(apiError);
  },
);
