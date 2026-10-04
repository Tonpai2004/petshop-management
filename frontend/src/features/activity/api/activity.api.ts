import { httpClient } from "@/lib/api/http-client";
import type { Activity } from "../types";

export const activityApi = {
  async recent(limit = 15) {
    const { data } = await httpClient.get<Activity[]>("/products/activity", { params: { limit } });
    return data;
  },

  async forProduct(productId: number, limit = 20) {
    const { data } = await httpClient.get<Activity[]>(`/products/${productId}/activity`, {
      params: { limit },
    });
    return data;
  },
};
