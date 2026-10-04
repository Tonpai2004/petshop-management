import { httpClient } from "@/lib/api/http-client";
import type { LoginRequest, LoginResponse, UserProfile } from "../types";

export const authApi = {
  async login(payload: LoginRequest) {
    const { data } = await httpClient.post<LoginResponse>("/auth/login", payload);
    return data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    await httpClient.post("/auth/change-password", payload);
  },

  async me() {
    const { data } = await httpClient.get<UserProfile>("/auth/me");
    return data;
  },
};
