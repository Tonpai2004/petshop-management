import { httpClient } from "@/lib/api/http-client";
import type { CreateMemberPayload, TeamMember } from "../types";

export const teamApi = {
  async list() {
    const { data } = await httpClient.get<TeamMember[]>("/auth/users");
    return data;
  },

  async create(payload: CreateMemberPayload) {
    const { data } = await httpClient.post<TeamMember>("/auth/users", payload);
    return data;
  },

  async setActive(id: number, isActive: boolean) {
    const { data } = await httpClient.patch<TeamMember>(`/auth/users/${id}/status`, { isActive });
    return data;
  },

  async resetPassword(id: number, newPassword: string) {
    await httpClient.post(`/auth/users/${id}/reset-password`, { newPassword });
  },
};
