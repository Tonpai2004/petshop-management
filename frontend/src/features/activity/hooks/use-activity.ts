import { useQuery } from "@tanstack/react-query";
import { activityApi } from "../api/activity.api";

export const activityKeys = {
  all: ["activity"] as const,
  recent: (limit: number) => [...activityKeys.all, "recent", limit] as const,
  product: (productId: number) => [...activityKeys.all, "product", productId] as const,
};

export function useRecentActivity(limit = 15) {
  return useQuery({
    queryKey: activityKeys.recent(limit),
    queryFn: () => activityApi.recent(limit),
    // The feed also shows what teammates did, so check for news every so often.
    refetchInterval: 60_000,
  });
}

export function useProductActivity(productId: number | null) {
  return useQuery({
    queryKey: activityKeys.product(productId ?? 0),
    queryFn: () => activityApi.forProduct(productId!),
    enabled: productId !== null,
  });
}
